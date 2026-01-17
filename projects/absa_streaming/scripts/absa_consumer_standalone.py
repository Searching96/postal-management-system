#!/usr/bin/env python3
# absa_consumer_standalone.py
# ======================================
# Standalone consumer - monitor Redis buffer và trigger inference
# Không cần Airflow

import torch
import torch.nn as nn
import json
import redis
import requests
import os
import logging
import time
from datetime import datetime, timedelta
from transformers import AutoTokenizer, AutoModel

# === Logging ===
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# === Config ===
MODEL_PATH = os.getenv("MODEL_PATH", "/models/postal_absa/phobert_absa_final")
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_TTL = 3600
BATCH_SIZE = int(os.getenv("BATCH_SIZE", 128))
BATCH_TIMEOUT_HOURS = int(os.getenv("BATCH_TIMEOUT_HOURS", 3))
CHECK_INTERVAL = 60  # Check mỗi 60 giây

LABEL_MAPPING = {
    -1: "not_mentioned",
    0: "negative",
    1: "neutral",
    2: "positive"
}

# === Redis ===
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

# === PhoBERT Model ===
class PhoBertABSA(nn.Module):
    def __init__(self, model_name, num_aspects, num_labels, dropout=0.3):
        super().__init__()
        self.phobert = AutoModel.from_pretrained(model_name)
        hidden_size = self.phobert.config.hidden_size
        self.dropout = nn.Dropout(dropout)
        self.classifiers = nn.ModuleList([
            nn.Linear(hidden_size, num_labels) for _ in range(num_aspects)
        ])
    
    def forward(self, input_ids, attention_mask):
        outputs = self.phobert(input_ids=input_ids, attention_mask=attention_mask)
        pooled = outputs.last_hidden_state[:, 0]
        pooled = self.dropout(pooled)
        logits = [classifier(pooled) for classifier in self.classifiers]
        return torch.stack(logits, dim=1)

def load_model():
    logger.info(f"[Model] Loading from {MODEL_PATH}...")
    
    with open(os.path.join(MODEL_PATH, "config.json"), "r") as f:
        config = json.load(f)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"[Model] Device: {device}")
    
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    
    model = PhoBertABSA(
        model_name=config["model_name"],
        num_aspects=config["num_aspects"],
        num_labels=config["num_labels"],
        dropout=config.get("dropout", 0.3)
    )
    
    state_dict = torch.load(os.path.join(MODEL_PATH, "model.pt"), map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    
    logger.info(f"[Model] ✅ Loaded! Aspects: {config['aspects']}")
    return model, tokenizer, config, device

def predict_batch(model, tokenizer, config, device, texts):
    if not texts:
        return []
    
    encodings = tokenizer(
        texts,
        padding=True,
        truncation=True,
        max_length=config.get("max_length", 256),
        return_tensors="pt"
    )
    
    input_ids = encodings["input_ids"].to(device)
    attention_mask = encodings["attention_mask"].to(device)
    
    with torch.no_grad():
        logits = model(input_ids, attention_mask)
        predictions = torch.argmax(logits, dim=-1) - 1
    
    results = []
    aspects = config["aspects"]
    
    for pred in predictions.cpu().numpy():
        result = {}
        for i, aspect in enumerate(aspects):
            label_id = int(pred[i])
            result[aspect] = LABEL_MAPPING.get(label_id, "unknown")
        results.append(result)
    
    return results

def get_buffer_count():
    return redis_client.llen("absa:buffer")

def get_last_batch_time():
    last_time = redis_client.get("absa:last_batch_time")
    if last_time:
        return datetime.fromisoformat(last_time)
    return None

def set_last_batch_time():
    redis_client.set("absa:last_batch_time", datetime.now().isoformat())

def should_trigger_inference():
    buffer_count = get_buffer_count()
    last_batch = get_last_batch_time()
    
    logger.info(f"[Monitor] Buffer: {buffer_count}/{BATCH_SIZE}")
    
    # Điều kiện 1: Đủ batch size
    if buffer_count >= BATCH_SIZE:
        logger.info(f"[Monitor] ✅ Batch size reached!")
        return True
    
    # Điều kiện 2: Timeout 3 tiếng
    if last_batch:
        time_elapsed = datetime.now() - last_batch
        if time_elapsed >= timedelta(hours=BATCH_TIMEOUT_HOURS) and buffer_count > 0:
            logger.info(f"[Monitor] ✅ Timeout reached with {buffer_count} items!")
            return True
    elif buffer_count > 0:
        set_last_batch_time()
    
    return False

def process_buffer(model, tokenizer, config, device):
    items = []
    for _ in range(BATCH_SIZE):
        item = redis_client.lpop("absa:buffer")
        if item:
            items.append(json.loads(item))
        else:
            break
    
    if not items:
        logger.info("[Batch] No items in buffer")
        return 0
    
    logger.info(f"[Batch] Processing {len(items)} items...")
    
    texts = [item["comment_text"] for item in items]
    predictions = predict_batch(model, tokenizer, config, device, texts)
    
    success_count = 0
    
    for item, pred in zip(items, predictions):
        order_comment_id = item["id"]
        callback_url = item.get("callback_url")
        
        result = {
            "order_comment_id": str(order_comment_id),
            "comment_text": item["comment_text"],
            "predictions": pred
        }
        
        # Save to Redis
        try:
            redis_client.setex(
                f"result:{order_comment_id}",
                REDIS_TTL,
                json.dumps(result)
            )
        except Exception as e:
            logger.error(f"[Redis] Error: {e}")
        
        # Send callback
        if callback_url and callback_url.strip():
            try:
                response = requests.post(callback_url, json=result, timeout=5)
                if response.status_code == 200:
                    logger.info(f"[Callback] ✅ {order_comment_id}")
                    success_count += 1
                else:
                    logger.warning(f"[Callback] ⚠️ {order_comment_id}: {response.status_code}")
            except Exception as e:
                logger.error(f"[Callback] ❌ {order_comment_id}: {e}")
        else:
            success_count += 1
    
    logger.info(f"[Batch] ✅ Done! {success_count}/{len(items)} successful")
    set_last_batch_time()
    return success_count

def main():
    logger.info("="*60)
    logger.info("🚀 Postal ABSA Consumer - Standalone Mode")
    logger.info(f"Batch Size: {BATCH_SIZE} | Timeout: {BATCH_TIMEOUT_HOURS}h")
    logger.info("="*60)
    
    # Load model once
    model, tokenizer, config, device = load_model()
    
    logger.info("[Consumer] Started monitoring...")
    
    while True:
        try:
            if should_trigger_inference():
                logger.info("[Consumer] 🔥 Triggering inference...")
                process_buffer(model, tokenizer, config, device)
            else:
                time.sleep(CHECK_INTERVAL)
        except KeyboardInterrupt:
            logger.info("[Consumer] Shutting down...")
            break
        except Exception as e:
            logger.error(f"[Consumer] Error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    main()
