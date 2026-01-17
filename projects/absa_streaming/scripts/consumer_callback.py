# SE363 – Phát triển ứng dụng trên nền tảng dữ liệu lớn
# Khoa Công nghệ Phần mềm – Trường Đại học Công nghệ Thông tin, ĐHQG-HCM
# HopDT – Faculty of Software Engineering, University of Information Technology (FSE-UIT)

# consumer_callback.py
# ======================================
# Consumer đọc dữ liệu từ Kafka topic "absa-reviews"
# → Tích lũy đến 128 comments
# → Chạy batch inference mô hình ABSA (.pt)
# → Gửi kết quả về Spring Boot qua callback hoặc lưu Redis

from pyspark.sql import SparkSession, functions as F, types as T
from pyspark.sql.functions import pandas_udf, from_json, col
import pandas as pd, torch, torch.nn as nn, torch.nn.functional as tF
from transformers import AutoTokenizer, AutoModel
import random, time, os, sys, json
import requests
import redis

# === 1. Spark session với Kafka connector ===
scala_version = "2.12"
spark_version = "3.5.1"

spark = (
    SparkSession.builder
    .appName("Kafka_ABSA_Callback")
    .config("spark.jars.packages",
            f"org.apache.spark:spark-sql-kafka-0-10_{scala_version}:{spark_version},"
            "org.apache.kafka:kafka-clients:3.6.1")
    .config("spark.sql.streaming.checkpointLocation", "/opt/airflow/checkpoints/absa_streaming_checkpoint")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("WARN")

# === Redis client để lưu kết quả ===
REDIS_HOST = "redis-results"
REDIS_PORT = 6379
REDIS_TTL = 3600  # 1 giờ

redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

# === 2. Đọc dữ liệu streaming từ Kafka ===
df_stream = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "kafka:9092")
    .option("subscribe", "absa-reviews")
    .option("startingOffsets", "latest")
    .option("maxOffsetsPerTrigger", 10)
    .load()
)

df_text = df_stream.selectExpr("CAST(value AS STRING) as Review")

# === 3. Định nghĩa mô hình ABSA ===
ASPECTS = ["Price","Shipping","Outlook","Quality","Size","Shop_Service","General","Others"]
MODEL_NAME = "xlm-roberta-base"
MODEL_PATH = "/opt/airflow/models/best_absa_hardshare.pt"
MAX_LEN = 64
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

_model, _tokenizer = None, None

class ABSAModel(nn.Module):
    def __init__(self, roberta, n_aspects=8):
        super().__init__()
        self.roberta = roberta
        hidden = roberta.config.hidden_size
        self.classifier = nn.Linear(hidden, n_aspects * 4)

    def forward(self, input_ids, attention_mask):
        out = self.roberta(input_ids=input_ids, attention_mask=attention_mask)
        pooled = out.last_hidden_state[:, 0]
        return self.classifier(pooled)

def load_model():
    global _model, _tokenizer
    if _model is None:
        print(f"[ABSA] Loading model from {MODEL_PATH}...")
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        base_model = AutoModel.from_pretrained(MODEL_NAME)
        _model = ABSAModel(base_model, len(ASPECTS))
        
        if os.path.exists(MODEL_PATH):
            state = torch.load(MODEL_PATH, map_location=DEVICE)
            _model.load_state_dict(state)
            print("[ABSA] ✅ Model loaded successfully.")
        else:
            print("[ABSA] ⚠️ Model file not found — using random weights for demo.")
        
        _model.to(DEVICE)
        _model.eval()
    return _model, _tokenizer

# === 4. UDF cho inference ===
@pandas_udf(T.ArrayType(T.FloatType()))
def absa_infer_udf(texts: pd.Series) -> pd.Series:
    model, tokenizer = load_model()
    
    results = []
    with torch.no_grad():
        for txt in texts:
            if not txt or txt.strip() == "":
                results.append([0.0] * (len(ASPECTS) * 4))
                continue
            
            enc = tokenizer(txt, return_tensors="pt", max_length=MAX_LEN, 
                          truncation=True, padding="max_length")
            enc = {k: v.to(DEVICE) for k, v in enc.items()}
            logits = model(**enc)
            probs = tF.softmax(logits.reshape(-1, 4), dim=1)
            results.append(probs.flatten().cpu().tolist())
    
    return pd.Series(results)

df_pred = df_text.withColumn("predictions", absa_infer_udf(F.col("Review")))

@pandas_udf("string")
def decode_sentiment(preds: pd.Series) -> pd.Series:
    SENTIMENTS = ["POS", "NEU", "NEG"]
    res = []
    for p in preds:
        if not p:
            res.append("?")
            continue
        p = list(p)
        p_m, p_s = p[:len(ASPECTS)], p[len(ASPECTS):]
        decoded = []
        for i, asp in enumerate(ASPECTS):
            triplet = p_s[i*3:(i+1)*3]
            s = SENTIMENTS[int(max(range(3), key=lambda j: triplet[j]))]
            decoded.append(f"{asp}:{s}")
        res.append(", ".join(decoded))
    return pd.Series(res)

df_final = df_pred.withColumn("decoded", decode_sentiment(F.col("predictions")))
for asp in ASPECTS:
    df_final = df_final.withColumn(asp, F.regexp_extract("decoded", f"{asp}:(\\w+)", 1))

# === Giải mã OrderComment JSON ===
review_schema = T.StructType([
    T.StructField("id", T.StringType()),
    T.StructField("comment_text", T.StringType()),
    T.StructField("callback_url", T.StringType())
])

df_final = df_final.withColumn("parsed", from_json(col("Review"), review_schema))
df_final = df_final.withColumn("order_comment_id", col("parsed.id"))
df_final = df_final.withColumn("CommentText", col("parsed.comment_text"))
df_final = df_final.withColumn("callback_url", col("parsed.callback_url"))

# === 5. Gửi kết quả về Spring Boot (callback) hoặc lưu Redis ===
batch_buffer = []
BATCH_SIZE = 128

def send_results_to_backend(batch_df, batch_id):
    """
    Tích lũy 128 comments, predict, và gửi kết quả về Spring Boot
    """
    global batch_buffer
    
    sys.stdout.reconfigure(encoding='utf-8')
    total_rows = batch_df.count()

    if total_rows == 0:
        print(f"[Batch {batch_id}] ⚠️ Không có dữ liệu mới.")
        return

    # Thu thập dữ liệu vào buffer
    batch_data = batch_df.select("order_comment_id", "CommentText", "callback_url", *ASPECTS).collect()
    batch_buffer.extend(batch_data)
    
    print(f"[Batch {batch_id}] Nhận {total_rows} OrderComments. Buffer: {len(batch_buffer)}/{BATCH_SIZE}")

    # Chỉ xử lý khi đủ BATCH_SIZE
    if len(batch_buffer) < BATCH_SIZE:
        print(f"[Batch {batch_id}] ⏳ Chưa đủ {BATCH_SIZE} comments, chờ thêm...")
        return
    
    # Lấy đúng BATCH_SIZE records để xử lý
    records_to_process = batch_buffer[:BATCH_SIZE]
    batch_buffer = batch_buffer[BATCH_SIZE:]
    
    print(f"[Batch {batch_id}] ✅ Đủ {BATCH_SIZE} comments! Đang gửi kết quả về backend...")
    
    success_count = 0
    failed_count = 0
    
    for row in records_to_process:
        try:
            order_comment_id = row["order_comment_id"]
            comment_text = row["CommentText"]
            callback_url = row["callback_url"]
            
            # Chuẩn bị kết quả
            result = {
                "order_comment_id": order_comment_id,
                "comment_text": comment_text,
                "predictions": {asp: row[asp] for asp in ASPECTS}
            }
            
            # Lưu vào Redis (để Spring Boot có thể poll)
            redis_client.setex(
                f"result:{order_comment_id}",
                REDIS_TTL,
                json.dumps(result)
            )
            
            # Gửi callback nếu có
            if callback_url and callback_url.strip():
                try:
                    response = requests.post(
                        callback_url,
                        json=result,
                        timeout=5
                    )
                    if response.status_code == 200:
                        print(f"[Batch {batch_id}] ✅ Callback success: OrderComment {order_comment_id}")
                    else:
                        print(f"[Batch {batch_id}] ⚠️ Callback failed ({response.status_code}): OrderComment {order_comment_id}")
                except Exception as e:
                    print(f"[Batch {batch_id}] ⚠️ Callback error: OrderComment {order_comment_id} - {str(e)}")
            
            success_count += 1
            
        except Exception as e:
            print(f"[Batch {batch_id}] ❌ Error processing result: {str(e)}")
            failed_count += 1
    
    print(f"[Batch {batch_id}] ✅ Processed: {success_count} success, {failed_count} failed")
    print(f"[Batch {batch_id}] 📦 Results saved to Redis with {REDIS_TTL}s TTL")

# === 6. Bắt đầu stream ===
query = (
    df_final.writeStream
    .foreachBatch(send_results_to_backend)
    .outputMode("append")
    .trigger(processingTime="10 seconds")
    .start()
)

print(f"🚀 Callback Streaming job started — batch size: {BATCH_SIZE} comments")
print(f"📡 Results will be sent to callback URLs or saved to Redis")
query.awaitTermination()
