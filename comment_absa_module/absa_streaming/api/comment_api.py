# SE363 – Phát triển ứng dụng trên nền tảng dữ liệu lớn
# Khoa Công nghệ Phần mềm – Trường Đại học Công nghệ Thông tin, ĐHQG-HCM
# HopDT – Faculty of Software Engineering, University of Information Technology (FSE-UIT)

# comment_api.py
# ======================================
# Flask API nhận comment từ Spring Boot backend
# và lưu vào Redis buffer để consumer xử lý batch inference

from flask import Flask, request, jsonify
import json
import logging
import time
import redis
import os

# === Cấu hình ===
app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv("REDIS_HOST", "postal-redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_TTL = 3600  # Kết quả tồn tại 1 giờ
BUFFER_KEY = "absa:buffer"

# === Kết nối Redis ===
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

# === API Endpoints ===

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "comment-api"}), 200

@app.route('/api/comments', methods=['POST'])
def receive_comment():
    """
    Nhận OrderComment từ Spring Boot và lưu vào Redis buffer
    
    Expected JSON format:
    {
        "id": 123,
        "comment_text": "Sản phẩm tốt! Giao hàng nhanh.",
        "callback_url": "http://your-backend:8080/api/callbacks/absa-result"
    }
    """
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.get_json()
        
        # Validate required fields
        if 'comment_text' not in data:
            return jsonify({"error": "Missing required field: comment_text"}), 400
        if 'id' not in data:
            return jsonify({"error": "Missing required field: id"}), 400
        
        # Chuẩn bị message
        comment_id = str(data["id"])
        
        # Fix callback URL: localhost -> host.docker.internal (for Docker containers)
        callback_url = data.get("callback_url")
        if callback_url and "localhost" in callback_url:
            callback_url = callback_url.replace("localhost", "host.docker.internal")
            logger.info(f"📝 Fixed callback URL: {callback_url}")
        
        message = {
            "id": comment_id,
            "comment_text": data["comment_text"],
            "timestamp": data.get("timestamp", time.strftime("%Y-%m-%dT%H:%M:%S")),
            "callback_url": callback_url
        }
        
        # Push vào Redis buffer
        redis_client.rpush(BUFFER_KEY, json.dumps(message))
        buffer_count = redis_client.llen(BUFFER_KEY)
        
        logger.info(f"✅ Added comment to buffer: {comment_id} (buffer: {buffer_count}/128)")
        
        return jsonify({
            "success": True,
            "message": "OrderComment received and queued for processing",
            "order_comment_id": comment_id,
            "buffer_count": buffer_count,
            "status_url": f"/api/results/{comment_id}"
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error processing comment: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/comments/batch', methods=['POST'])
def receive_comments_batch():
    """
    Nhận nhiều OrderComments cùng lúc từ Spring Boot
    
    Expected JSON format:
    {
        "comments": [
            {"id": 1, "comment_text": "Sản phẩm tốt!", "callback_url": "http://..."},
            {"id": 2, "comment_text": "Giao hàng nhanh!"}
        ]
    }
    """
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.get_json()
        
        if 'comments' not in data or not isinstance(data['comments'], list):
            return jsonify({"error": "Missing or invalid 'comments' array"}), 400
        
        success_count = 0
        failed_count = 0
        comment_ids = []
        
        for comment_data in data['comments']:
            try:
                if 'comment_text' not in comment_data or 'id' not in comment_data:
                    failed_count += 1
                    continue
                
                comment_id = str(comment_data["id"])
                message = {
                    "id": comment_id,
                    "comment_text": comment_data["comment_text"],
                    "timestamp": comment_data.get("timestamp", time.strftime("%Y-%m-%dT%H:%M:%S")),
                    "callback_url": comment_data.get("callback_url")
                }
                
                # Push vào Redis buffer
                redis_client.rpush(BUFFER_KEY, json.dumps(message))
                comment_ids.append(comment_id)
                success_count += 1
                
            except Exception as e:
                logger.error(f"Failed to add comment: {str(e)}")
                failed_count += 1
        
        buffer_count = redis_client.llen(BUFFER_KEY)
        logger.info(f"✅ Batch added: {success_count} success, {failed_count} failed (buffer: {buffer_count}/128)")
        
        return jsonify({
            "success": True,
            "sent": success_count,
            "failed": failed_count,
            "comment_ids": comment_ids,
            "buffer_count": buffer_count
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error processing batch: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/results/<comment_id>', methods=['GET'])
def get_result(comment_id):
    """
    Lấy kết quả predict cho một OrderComment ID cụ thể
    
    Response:
    {
        "success": true,
        "order_comment_id": "123",
        "status": "completed",  // pending, completed, failed
        "result": {
            "comment_text": "...",
            "predictions": {
                "Price": "POS",
                "Shipping": "NEU",
                ...
            }
        }
    }
    """
    try:
        # Lấy từ Redis
        result_json = redis_client.get(f"result:{comment_id}")
        
        if result_json:
            result = json.loads(result_json)
            return jsonify({
                "success": True,
                "order_comment_id": comment_id,
                "status": "completed",
                "result": result
            }), 200
        else:
            # Chưa có kết quả
            return jsonify({
                "success": True,
                "order_comment_id": comment_id,
                "status": "pending",
                "message": "Result not yet available. Batch processing in progress."
            }), 202  # 202 Accepted
            
    except Exception as e:
        logger.error(f"❌ Error getting result: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/results/batch', methods=['POST'])
def get_results_batch():
    """
    Lấy kết quả cho nhiều comment IDs
    
    Request:
    {
        "comment_ids": ["comment_1", "comment_2", "comment_3"]
    }
    """
    try:
        data = request.get_json()
        comment_ids = data.get('comment_ids', [])
        
        results = {}
        for comment_id in comment_ids:
            result_json = redis_client.get(f"result:{comment_id}")
            if result_json:
                results[comment_id] = json.loads(result_json)
            else:
                results[comment_id] = {"status": "pending"}
        
        return jsonify({
            "success": True,
            "results": results
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting batch results: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# === Batch Status APIs ===

BATCH_SIZE = 128
BATCH_TIMEOUT_HOURS = 3

@app.route('/api/batch/status', methods=['GET'])
def get_batch_status():
    """
    Lấy trạng thái batch hiện tại: số lượng comments và thời gian còn lại
    
    Response:
    {
        "success": true,
        "current_count": 45,
        "batch_size": 128,
        "remaining_count": 83,
        "last_batch_time": "2026-01-17T10:30:00",
        "time_elapsed_seconds": 3600,
        "time_remaining_seconds": 7200,
        "will_trigger_at": "128 comments OR 2026-01-17T13:30:00"
    }
    """
    try:
        from datetime import datetime, timedelta
        
        # Lấy số lượng comments trong buffer
        current_count = redis_client.llen("absa:buffer")
        remaining_count = max(0, BATCH_SIZE - current_count)
        
        # Lấy thời gian batch cuối
        last_batch_str = redis_client.get("absa:last_batch_time")
        
        if last_batch_str:
            last_batch_time = datetime.fromisoformat(last_batch_str)
            time_elapsed = datetime.now() - last_batch_time
            time_remaining = timedelta(hours=BATCH_TIMEOUT_HOURS) - time_elapsed
            time_remaining_seconds = max(0, int(time_remaining.total_seconds()))
            next_trigger_time = last_batch_time + timedelta(hours=BATCH_TIMEOUT_HOURS)
        else:
            last_batch_time = None
            time_elapsed = timedelta(0)
            time_remaining_seconds = BATCH_TIMEOUT_HOURS * 3600
            next_trigger_time = datetime.now() + timedelta(hours=BATCH_TIMEOUT_HOURS)
        
        return jsonify({
            "success": True,
            "current_count": current_count,
            "batch_size": BATCH_SIZE,
            "remaining_count": remaining_count,
            "last_batch_time": last_batch_time.isoformat() if last_batch_time else None,
            "time_elapsed_seconds": int(time_elapsed.total_seconds()),
            "time_remaining_seconds": time_remaining_seconds,
            "will_trigger_at": f"{BATCH_SIZE} comments OR {next_trigger_time.strftime('%Y-%m-%d %H:%M:%S')}"
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting batch status: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/batch/fill', methods=['POST'])
def fill_batch():
    """
    Fill batch với filler comments để force trigger inference.
    Spring Boot gọi API này để đẩy đủ 128 comments.
    
    Request:
    {
        "filler_text": "FILLER_COMMENT_DO_NOT_PROCESS",  // Nội dung filler (để lọc kết quả sau)
        "callback_url": "http://host.docker.internal:8080/api/callbacks/absa"  // optional
    }
    
    Response:
    {
        "success": true,
        "filled_count": 83,
        "total_count": 128,
        "message": "Batch filled and will trigger inference"
    }
    """
    try:
        data = request.get_json() or {}
        filler_text = data.get("filler_text", "FILLER_COMMENT_IGNORE")
        callback_url = data.get("callback_url")
        
        # Tính số lượng cần fill
        current_count = redis_client.llen("absa:buffer")
        fill_count = max(0, BATCH_SIZE - current_count)
        
        if fill_count == 0:
            return jsonify({
                "success": True,
                "filled_count": 0,
                "total_count": current_count,
                "message": "Batch already full, inference will trigger soon"
            }), 200
        
        # Tạo filler comments
        filler_ids = []
        for i in range(fill_count):
            filler_id = f"FILLER_{int(time.time() * 1000)}_{i}"
            message = {
                "id": filler_id,
                "comment_text": filler_text,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "callback_url": callback_url,
                "is_filler": True  # Đánh dấu là filler
            }
            
            # Gửi vào Redis buffer (consumer sẽ xử lý từ Redis)
            redis_client.rpush("absa:buffer", json.dumps(message))
            filler_ids.append(filler_id)
        
        new_count = redis_client.llen("absa:buffer")
        
        logger.info(f"✅ Filled batch with {fill_count} filler comments")
        
        return jsonify({
            "success": True,
            "filled_count": fill_count,
            "total_count": new_count,
            "filler_ids": filler_ids,
            "filler_text": filler_text,
            "message": "Batch filled and will trigger inference soon"
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error filling batch: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# === Khởi động ===
if __name__ == '__main__':
    try:
        logger.info("🚀 Starting Comment API on port 5000...")
        app.run(host='0.0.0.0', port=5000, debug=False)
    except Exception as e:
        logger.error(f"❌ Failed to start API: {str(e)}")
        raise
