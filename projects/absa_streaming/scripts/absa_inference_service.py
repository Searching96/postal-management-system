# SE363 – Phát triển ứng dụng trên nền tảng dữ liệu lớn
# Khoa Công nghệ Phần mềm – Trường Đại học Công nghệ Thông tin, ĐHQG-HCM

# absa_inference_service.py
# ======================================
# Service thực hiện batch inference với PhoBERT ABSA model
# - Load model từ /opt/airflow/models/postal_absa/phobert_absa_final
# - Batch inference 128 comments hoặc mỗi 3 tiếng
# - Gửi kết quả về callback URL hoặc lưu Redis

import torch
import torch.nn as nn
import json
import redis
import requests
import time
import os
from transformers import AutoTokenizer
from kafka import KafkaConsumer
import logging
from datetime import datetime, timedelta

# === Logging ===
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# === Config ===
MODEL_PATH = "/opt/airflow/models/postal_absa/phobert_absa_final"
KAFKA_SERVER = "kafka:9092"
TOPIC = "absa-reviews"
REDIS_HOST = "redis-results"
REDIS_PORT = 6379
REDIS_TTL = 3600  # 1 giờ

BATCH_SIZE = 128
BATCH_TIMEOUT_HOURS = 3  # Trigger inference sau 3 tiếng dù chưa đủ 128

# Mapping label: -1 (not mentioned), 0 (negative), 1 (neutral), 2 (positive)
LABEL_MAPPING = {
    -1: "not_mentioned",
    0: "negative",
    1: "neutral",
    2: "positive"
}

# === Redis client ===
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

# === PhoBERT ABSA Model ===
class PhoBertABSA(nn.Module):
    def __init__(self, model_name, num_aspects, num_labels, dropout=0.3):
        super().__init__()
        from transformers import AutoModel
        self.bert = AutoModel.from_pretrained(model_name)
        hidden_size = self.bert.config.hidden_size
        self.dropout = nn.Dropout(dropout)
        # Mỗi aspect có 1 classifier riêng
        self.classifiers = nn.ModuleList([
            nn.Linear(hidden_size, num_labels) for _ in range(num_aspects)
        ])
    
    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled = outputs.last_hidden_state[:, 0]  # [CLS] token
        pooled = self.dropout(pooled)
        # Output cho từng aspect
        logits = [classifier(pooled) for classifier in self.classifiers]
        return torch.stack(logits, dim=1)  # (batch, num_aspects, num_labels)

# === Load model và tokenizer ===
_model = None
_tokenizer = None
_config = None
_device = None

def load_model():
    global _model, _tokenizer, _config, _device
    
    if _model is not None:
        return _model, _tokenizer, _config
    
    logger.info(f"[Model] Loading PhoBERT ABSA from {MODEL_PATH}...")
    
    # Load config
    with open(os.path.join(MODEL_PATH, "config.json"), "r") as f:
        _config = json.load(f)
    
    logger.info(f"[Model] Config: {_config}")
    
    # Device
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"[Model] Using device: {_device}")
    
    # Load tokenizer
    _tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    
    # Load model
    _model = PhoBertABSA(
        model_name=_config["model_name"],
        num_aspects=_config["num_aspects"],
        num_labels=_config["num_labels"],
        dropout=_config.get("dropout", 0.3)
    )
    
    # Load weights
    model_weights_path = os.path.join(MODEL_PATH, "model.pt")
    state_dict = torch.load(model_weights_path, map_location=_device)
    _model.load_state_dict(state_dict)
    _model.to(_device)
    _model.eval()
    
    logger.info(f"[Model] ✅ Model loaded successfully!")
    logger.info(f"[Model] Aspects: {_config['aspects']}")
    
    return _model, _tokenizer, _config

# === Inference function ===
def predict_batch(texts):
    """
    Batch inference cho danh sách texts
    Returns: List of predictions, mỗi prediction là dict {aspect: label}
    """
    model, tokenizer, config = load_model()
    
    if not texts:
        return []
    
    # Tokenize
    encodings = tokenizer(
        texts,
        padding=True,
        truncation=True,
        max_length=config.get("max_length", 256),
        return_tensors="pt"
    )
    
    input_ids = encodings["input_ids"].to(_device)
    attention_mask = encodings["attention_mask"].to(_device)
    
    # Inference
    with torch.no_grad():
        logits = model(input_ids, attention_mask)  # (batch, num_aspects, num_labels)
        predictions = torch.argmax(logits, dim=-1)  # (batch, num_aspects)
        # Shift labels: model outputs 0,1,2,3 -> we want -1,0,1,2
        predictions = predictions - 1
    
    # Convert to list of dicts
    results = []
    aspects = config["aspects"]
    
    for pred in predictions.cpu().numpy():
        result = {}
        for i, aspect in enumerate(aspects):
            label_id = int(pred[i])
            result[aspect] = LABEL_MAPPING.get(label_id, "unknown")
        results.append(result)
    
    return results

# === Process batch và gửi callback ===
def process_and_send_results(batch_data):
    """
    Process batch data và gửi kết quả về callback URL hoặc lưu Redis
    batch_data: List of {"id": ..., "comment_text": ..., "callback_url": ...}
    """
    if not batch_data:
        logger.info("[Batch] Empty batch, skipping...")
        return
    
    logger.info(f"[Batch] Processing {len(batch_data)} comments...")
    
    # Extract texts
    texts = [item["comment_text"] for item in batch_data]
    
    # Batch predict
    predictions = predict_batch(texts)
    
    # Send results
    success_count = 0
    failed_count = 0
    
    for item, pred in zip(batch_data, predictions):
        order_comment_id = item["id"]
        callback_url = item.get("callback_url")
        
        result = {
            "order_comment_id": order_comment_id,
            "comment_text": item["comment_text"],
            "predictions": pred
        }
        
        # Lưu vào Redis
        try:
            redis_client.setex(
                f"result:{order_comment_id}",
                REDIS_TTL,
                json.dumps(result)
            )
        except Exception as e:
            logger.error(f"[Redis] Error saving result: {e}")
        
        # Gửi callback nếu có
        if callback_url and callback_url.strip():
            try:
                response = requests.post(
                    callback_url,
                    json=result,
                    timeout=5
                )
                if response.status_code == 200:
                    logger.info(f"[Callback] ✅ Success: OrderComment {order_comment_id}")
                    success_count += 1
                else:
                    logger.warning(f"[Callback] ⚠️ Failed ({response.status_code}): {order_comment_id}")
                    failed_count += 1
            except Exception as e:
                logger.error(f"[Callback] ❌ Error: {order_comment_id} - {e}")
                failed_count += 1
        else:
            success_count += 1
    
    logger.info(f"[Batch] ✅ Completed: {success_count} success, {failed_count} failed")
    return success_count, failed_count

# === Kafka Consumer với batch logic ===
def run_consumer():
    """
    Chạy Kafka consumer với logic batch:
    - Tích lũy đến 128 comments hoặc
    - Timeout 3 tiếng
    """
    logger.info("[Consumer] Starting Kafka consumer...")
    logger.info(f"[Consumer] Batch size: {BATCH_SIZE}, Timeout: {BATCH_TIMEOUT_HOURS}h")
    
    # Pre-load model
    load_model()
    
    consumer = KafkaConsumer(
        TOPIC,
        bootstrap_servers=KAFKA_SERVER,
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        auto_offset_reset="latest",
        enable_auto_commit=True,
        group_id="absa-inference-group",
        consumer_timeout_ms=10000  # 10 seconds poll timeout
    )
    
    batch_buffer = []
    last_batch_time = datetime.now()
    
    logger.info(f"[Consumer] 🚀 Listening on topic: {TOPIC}")
    
    try:
        while True:
            # Poll messages
            messages = consumer.poll(timeout_ms=5000)
            
            for topic_partition, records in messages.items():
                for record in records:
                    data = record.value
                    batch_buffer.append({
                        "id": data.get("id"),
                        "comment_text": data.get("comment_text"),
                        "callback_url": data.get("callback_url")
                    })
                    logger.info(f"[Consumer] Received: {data.get('id')} | Buffer: {len(batch_buffer)}/{BATCH_SIZE}")
            
            # Check if should process batch
            time_since_last_batch = datetime.now() - last_batch_time
            should_process = (
                len(batch_buffer) >= BATCH_SIZE or 
                (len(batch_buffer) > 0 and time_since_last_batch >= timedelta(hours=BATCH_TIMEOUT_HOURS))
            )
            
            if should_process:
                if len(batch_buffer) >= BATCH_SIZE:
                    logger.info(f"[Consumer] 📦 Batch size reached ({len(batch_buffer)})")
                else:
                    logger.info(f"[Consumer] ⏰ Timeout reached ({time_since_last_batch})")
                
                # Process batch
                process_and_send_results(batch_buffer)
                batch_buffer = []
                last_batch_time = datetime.now()
            
    except KeyboardInterrupt:
        logger.info("[Consumer] Shutting down...")
    finally:
        # Process remaining
        if batch_buffer:
            logger.info(f"[Consumer] Processing remaining {len(batch_buffer)} items...")
            process_and_send_results(batch_buffer)
        consumer.close()

# === Main ===
if __name__ == "__main__":
    run_consumer()
