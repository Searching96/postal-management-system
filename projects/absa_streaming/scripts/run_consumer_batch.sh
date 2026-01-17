#!/bin/bash
# ==========================================
# Script: run_consumer_batch.sh
# Chức năng:
#   - Khởi động Spark Structured Streaming Consumer (Batch Mode)
#   - Đọc dữ liệu từ Kafka, tích lũy 100 comments rồi predict
#   - Ghi kết quả vào PostgreSQL
# ==========================================

set -e

echo "[Consumer Batch] Starting Spark Structured Streaming job (Batch Mode)..."

spark-submit \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1,org.postgresql:postgresql:42.6.0 \
  /opt/airflow/projects/absa_streaming/scripts/consumer_postgres_streaming_batch.py

status=$?
if [ $status -eq 0 ]; then
  echo "[Consumer Batch] Completed successfully."
else
  echo "[Consumer Batch] Failed with exit code $status."
fi

exit $status
