# batch_inference_trigger.py
# ======================================
# Script để trigger batch inference từ DAG
# Lấy data từ Redis buffer, chạy inference, gửi callback

import torch
import torch.nn as nn
import json
import redis
import requests
import os
import logging
from transformers import AutoTokenizer, AutoModel

# === Logging ===
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# === Config ===
MODEL_PATH = "/opt/airflow/models/postal_absa/phobert_absa_final"
REDIS_HOST = "redis-results"
REDIS_PORT = 6379
REDIS_TTL = 3600
BATCH_SIZE = 128

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
        self.bert = AutoModel.from_pretrained(model_name)
        hidden_size = self.bert.config.hidden_size
        self.dropout = nn.Dropout(dropout)
        self.classifiers = nn.ModuleList([
            nn.Linear(hidden_size, num_labels) for _ in range(num_aspects)
        ])
    
    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
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
        predictions = torch.argmax(logits, dim=-1) - 1  # Shift to -1,0,1,2
    
    results = []
    aspects = config["aspects"]
    
    for pred in predictions.cpu().numpy():
        result = {}
        for i, aspect in enumerate(aspects):
            label_id = int(pred[i])
            result[aspect] = LABEL_MAPPING.get(label_id, "unknown")
        results.append(result)
    
    return results

def process_buffer():
    """Lấy data từ Redis buffer và inference"""
    # Lấy tất cả items từ buffer (max BATCH_SIZE)
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
    
    logger.info(f"[Batch] Processing {len(items)} items from buffer...")
    
    # Load model
    model, tokenizer, config, device = load_model()
    
    # Extract texts
    texts = [item["comment_text"] for item in items]
    
    # Predict
    predictions = predict_batch(model, tokenizer, config, device, texts)
    
    # Send results
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
    return success_count

if __name__ == "__main__":
    process_buffer()
