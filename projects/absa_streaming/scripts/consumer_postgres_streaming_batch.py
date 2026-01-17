# SE363 – Phát triển ứng dụng trên nền tảng dữ liệu lớn
# Khoa Công nghệ Phần mềm – Trường Đại học Công nghệ Thông tin, ĐHQG-HCM
# HopDT – Faculty of Software Engineering, University of Information Technology (FSE-UIT)

# consumer_postgres_streaming_batch.py
# ======================================
# Consumer đọc dữ liệu từ Kafka topic "absa-reviews"
# → Tích lũy đến 100 comments
# → Chạy batch inference mô hình ABSA (.pt)
# → Ghi kết quả vào PostgreSQL

from pyspark.sql import SparkSession, functions as F, types as T
from pyspark.sql.functions import pandas_udf, from_json, col, count, window
import pandas as pd, torch, torch.nn as nn, torch.nn.functional as tF
from transformers import AutoTokenizer, AutoModel
import random, time, os, sys, json

# === 1. Spark session với Kafka connector ===
scala_version = "2.12"
spark_version = "3.5.1"

spark = (
    SparkSession.builder
    .appName("Kafka_ABSA_Postgres_Batch")
    .config("spark.jars.packages",
            f"org.apache.spark:spark-sql-kafka-0-10_{scala_version}:{spark_version},"
            "org.postgresql:postgresql:42.6.0,"
            "org.apache.kafka:kafka-clients:3.6.1")
    .config("spark.sql.streaming.checkpointLocation", "/opt/airflow/checkpoints/absa_streaming_checkpoint")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("WARN")

# === 2. Đọc dữ liệu streaming từ Kafka ===
df_stream = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "kafka:9092")
    .option("subscribe", "absa-reviews")
    .option("startingOffsets", "latest")
    .option("maxOffsetsPerTrigger", 10)  # Đọc tối đa 10 messages mỗi lần trigger
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

# === 4. UDF cho inference (batch processing) ===
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

# === Giải mã Review JSON thành text tiếng Việt trước khi stream ===
review_schema = T.StructType([
    T.StructField("id", T.StringType()),
    T.StructField("review", T.StringType())
])
df_final = df_final.withColumn("ReviewText", from_json(col("Review"), review_schema).getField("review"))

# === 5. Ghi kết quả vào PostgreSQL với batch 128 records ===
batch_buffer = []
BATCH_SIZE = 128

def write_to_postgres(batch_df, batch_id):
    """
    Tích lũy đến 128 comments rồi mới predict và ghi vào DB
    """
    global batch_buffer
    
    sys.stdout.reconfigure(encoding='utf-8')
    total_rows = batch_df.count()

    if total_rows == 0:
        print(f"[Batch {batch_id}] ⚠️ Không có dữ liệu mới.")
        return

    # Thu thập dữ liệu vào buffer
    batch_data = batch_df.select("ReviewText", *ASPECTS).collect()
    batch_buffer.extend(batch_data)
    
    print(f"[Batch {batch_id}] Nhận {total_rows} records. Buffer hiện tại: {len(batch_buffer)}/{BATCH_SIZE}")

    # Chỉ xử lý khi đủ BATCH_SIZE
    if len(batch_buffer) < BATCH_SIZE:
        print(f"[Batch {batch_id}] ⏳ Chưa đủ {BATCH_SIZE} comments, chờ thêm...")
        return
    
    # Lấy đúng BATCH_SIZE records để xử lý
    records_to_process = batch_buffer[:BATCH_SIZE]
    batch_buffer = batch_buffer[BATCH_SIZE:]  # Giữ lại phần còn lại
    
    print(f"[Batch {batch_id}] ✅ Đủ {BATCH_SIZE} comments! Bắt đầu predict và ghi vào PostgreSQL...")
    
    # Chuyển về DataFrame để ghi
    df_to_write = spark.createDataFrame(records_to_process)
    
    preview = df_to_write.limit(5).toPandas().to_dict(orient="records")
    print(f"[Batch {batch_id}] Preview 5 records đầu:")
    print(json.dumps(preview, ensure_ascii=False, indent=2))

    try:
        (df_to_write
            .write
            .format("jdbc")
            .option("url", "jdbc:postgresql://postgres:5432/airflow")
            .option("dbtable", "absa_results")
            .option("user", "airflow")
            .option("password", "airflow")
            .option("driver", "org.postgresql.Driver")
            .option("charset", "utf8")
            .mode("append")
            .save()
        )
        print(f"[Batch {batch_id}] ✅ Ghi {len(records_to_process)} records vào PostgreSQL thành công!")

    except Exception as e:
        print(f"[Batch {batch_id}] ⚠️ Không thể ghi vào PostgreSQL: {str(e)}")
        # Log ra console thay thế
        subset = df_to_write.limit(5).toPandas().to_dict(orient="records")
        print(json.dumps(subset, ensure_ascii=False, indent=2))

# === 6. Bắt đầu stream với trigger dài hơn để tích lũy dữ liệu ===
query = (
    df_final.writeStream
    .foreachBatch(write_to_postgres)
    .outputMode("append")
    .trigger(processingTime="10 seconds")  # Trigger mỗi 10 giây
    .start()
)

print(f"🚀 Batch Streaming job started — tích lũy {BATCH_SIZE} comments trước khi predict...")
print(f"📊 Mỗi {BATCH_SIZE} comments sẽ được xử lý cùng lúc và ghi vào PostgreSQL.")
query.awaitTermination()
