# ABSA Integration - Implementation Guide

## Tổng quan
Hệ thống đã được tích hợp ABSA (Aspect-Based Sentiment Analysis) để phân tích comment của khách hàng theo 4 khía cạnh:
- **time** (thời gian giao hàng)
- **staff** (thái độ nhân viên)
- **quality** (chất lượng dịch vụ)
- **price** (giá cả)

## Luồng hoạt động

```
Customer tạo comment → OrderService lưu comment → Gửi tới Flask API (async) 
→ Flask API thêm vào Redis buffer → Consumer xử lý batch (mỗi 60s hoặc đủ 128 comments)
→ PhoBERT Model phân tích → Callback về Spring Boot → Cập nhật OrderComment
```

## Các thành phần đã tích hợp

### 1. Entity: OrderComment
**File:** `entity/order/OrderComment.java`

Đã thêm các trường:
- `absaStatus`: trạng thái phân tích (pending, processing, success, error)
- `absaTimeAspect`: sentiment về thời gian
- `absaStaffAspect`: sentiment về nhân viên
- `absaQualityAspect`: sentiment về chất lượng
- `absaPriceAspect`: sentiment về giá cả
- `absaAnalyzedAt`: thời điểm hoàn thành phân tích

### 2. DTOs

#### Request DTO
**File:** `dto/request/absa/ABSAAnalysisRequest.java`
- DTO để gửi comment tới ABSA API

#### Response DTO
**File:** `dto/response/absa/ABSAResultResponse.java`
- DTO nhận kết quả từ ABSA callback

**Updated:** `dto/response/order/CommentResponse.java`
- Đã thêm các trường ABSA để trả về cho frontend

### 3. Service Layer

#### Interface: IABSAService
**File:** `service/IABSAService.java`

Các method:
- `sendCommentForAnalysis()`: Gửi comment tới ABSA API
- `processAnalysisResult()`: Xử lý kết quả từ callback
- `getAnalysisResult()`: Lấy kết quả phân tích
- `triggerBatchAnalysis()`: Trigger batch analysis thủ công

#### Implementation: ABSAServiceImpl
**File:** `service/impl/ABSAServiceImpl.java`

Features:
- Sử dụng WebClient để gọi Flask API (non-blocking)
- Xử lý callback từ Python consumer
- Map aspect values từ số (-1, 0, 1, 2) sang text (not_mentioned, negative, neutral, positive)
- Error handling và logging

### 4. Controller: ABSAController
**File:** `controller/ABSAController.java`

Endpoints:
- `POST /api/absa/callback`: Nhận kết quả từ Python (public, không cần auth)
- `POST /api/absa/trigger-batch`: Trigger batch analysis (requires MANAGER role)
- `GET /api/absa/results/{orderCommentId}`: Lấy kết quả phân tích

### 5. Integration vào OrderService
**File:** `service/impl/OrderServiceImpl.java`

- Tự động gửi comment tới ABSA khi customer tạo hoặc update comment
- Async call - không block luồng chính
- Error handling - tiếp tục hoạt động nếu ABSA fail

### 6. Configuration
**File:** `application.yml`

```yaml
absa:
  api:
    url: ${ABSA_API_URL:http://localhost:5000}
  callback:
    url: ${ABSA_CALLBACK_URL:http://host.docker.internal:8080/api/absa/callback}
```

## Cách sử dụng

### 1. Khởi động ABSA Service
```bash
cd /path/to/absa-service
docker-compose up -d
```

### 2. Cấu hình Environment Variables (optional)
Tạo file `.env` trong thư mục backend:
```properties
ABSA_API_URL=http://localhost:5000
ABSA_CALLBACK_URL=http://localhost:8080/api/absa/callback
```

### 3. Build và chạy Spring Boot
```bash
mvn clean install
mvn spring-boot:run
```

## API Usage Examples

### Customer tạo comment
```bash
POST /api/orders/{orderId}/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "commentText": "Dịch vụ bưu điện nhanh chóng, nhân viên nhiệt tình nhưng giá hơi cao"
}
```

Response sẽ bao gồm:
```json
{
  "id": "...",
  "orderId": "...",
  "commentText": "...",
  "absaStatus": "processing",
  "createdAt": "2026-01-18T10:00:00"
}
```

### Xem kết quả ABSA
```bash
GET /api/orders/{orderId}/comments
Authorization: Bearer <token>
```

Response sau khi phân tích xong:
```json
{
  "id": "...",
  "orderId": "...",
  "commentText": "...",
  "absaStatus": "success",
  "absaTimeAspect": "positive",
  "absaStaffAspect": "positive",
  "absaQualityAspect": "neutral",
  "absaPriceAspect": "negative",
  "absaAnalyzedAt": "2026-01-18T10:05:30"
}
```

### Trigger batch analysis (Manager only)
```bash
POST /api/absa/trigger-batch
Authorization: Bearer <token>
```

### Lấy ABSA result trực tiếp
```bash
GET /api/absa/results/{orderCommentId}
Authorization: Bearer <token>
```

## Aspect Values

| Value | Meaning |
|-------|---------|
| `not_mentioned` | Khía cạnh không được đề cập trong comment |
| `negative` | Sentiment tiêu cực |
| `neutral` | Sentiment trung tính |
| `positive` | Sentiment tích cực |

## Batch Processing

- **Tự động**: Hệ thống tự động xử lý khi:
  - Đủ 128 comments trong buffer, HOẶC
  - Sau 3 giờ kể từ comment đầu tiên

- **Thủ công**: Manager có thể trigger ngay lập tức:
  ```bash
  POST /api/absa/trigger-batch
  ```

## Error Handling

1. **ABSA service không khả dụng**: Comment vẫn được lưu, `absaStatus = null`
2. **Analysis fail**: `absaStatus = "error"`
3. **Callback fail**: ABSA service sẽ retry 3 lần

## Testing

### Test callback endpoint
```bash
curl -X POST http://localhost:8080/api/absa/callback \
  -H "Content-Type: application/json" \
  -d '{
    "order_comment_id": "your-uuid-here",
    "status": "success",
    "aspects": {
      "time": "positive",
      "staff": "neutral",
      "quality": "positive",
      "price": "not_mentioned"
    },
    "timestamp": "2026-01-18T10:05:30"
  }'
```

### Check ABSA batch status
```bash
curl http://localhost:5000/api/batch/status
```

## Monitoring

Logs để theo dõi:
- `Sending comment {} to ABSA for analysis`
- `Successfully sent comment {} to ABSA`
- `Processing ABSA result for comment {}`
- `ABSA analysis completed for comment {}`

## Database Schema Update

Khi chạy lần đầu, Hibernate sẽ tự động thêm các cột mới vào bảng `order_comments`:
- `absa_status` VARCHAR(20)
- `absa_time_aspect` VARCHAR(20)
- `absa_staff_aspect` VARCHAR(20)
- `absa_quality_aspect` VARCHAR(20)
- `absa_price_aspect` VARCHAR(20)
- `absa_analyzed_at` DATETIME

## Notes

- ABSA analysis là **non-blocking** - không ảnh hưởng tới performance của việc tạo comment
- Chỉ customer (sender/receiver) mới có thể tạo comment và xem kết quả ABSA
- Kết quả ABSA được cache trong database, không cần call API mỗi lần
- Callback URL phải accessible từ Docker container của ABSA service

## Troubleshooting

### Comment không được phân tích
1. Check ABSA service đang chạy: `docker ps`
2. Check logs: `docker logs postal-comment-api`
3. Check batch status: `GET http://localhost:5000/api/batch/status`

### Callback không về
1. Verify callback URL trong application.yml
2. Check network connectivity từ Docker container
3. Sử dụng `host.docker.internal` nếu Spring Boot chạy local

### absaStatus = "error"
1. Check ABSA service logs
2. Verify comment text encoding (UTF-8)
3. Kiểm tra PhoBERT model đã load đúng
