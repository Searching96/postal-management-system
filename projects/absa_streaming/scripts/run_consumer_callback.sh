#!/bin/bash
# ==========================================
# Script: run_consumer_callback.sh
# Chức năng:
#   - Khởi động Spark Structured Streaming Consumer (Callback Mode)
#   - Đọc từ Kafka, tích lũy 128 comments, predict
#   - Gửi kết quả về Spring Boot qua callback hoặc Redis
# ==========================================

set -e

echo "[Consumer Callback] Starting Spark Structured Streaming job (Callback Mode)..."

spark-submit \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1 \
  /opt/airflow/projects/absa_streaming/scripts/consumer_callback.py

status=$?
if [ $status -eq 0 ]; then
  echo "[Consumer Callback] Completed successfully."
else
  echo "[Consumer Callback] Failed with exit code $status."
fi

exit $status
