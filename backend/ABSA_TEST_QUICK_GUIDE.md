# Test ABSA Integration - Quick Guide

## Automatic Testing

Khi chạy Spring Boot, hệ thống sẽ tự động tạo:
- Test customer: `0901234567` / `123456`
- Test order với tracking number: `VNTEST12345VN`

Log sẽ hiển thị Order ID như sau:
```
============================================
==> TEST ORDER ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
==> Use this Order ID for ABSA testing
============================================
```

## Run Test Script

Script sẽ **tự động lấy Order ID** từ API endpoint `/api/test/order`:

```powershell
.\test-absa-simple.ps1 -Username "0901234567" -Password "123456"
```

Hoặc chỉ định Order ID cụ thể:

```powershell
.\test-absa-simple.ps1 -OrderId "your-order-uuid" -Username "0901234567" -Password "123456"
```

## Test Steps (Automated)

1. ✅ Check ABSA service (localhost:5000)
2. ✅ Check Spring Boot (localhost:8080)
3. ✅ Login with test customer
4. ✅ **Auto-fetch test order ID** (NEW!)
5. ✅ Verify order exists
6. ✅ Create comment on order
7. ✅ Check ABSA buffer status
8. ✅ Trigger batch analysis
9. ✅ Wait for PhoBERT processing
10. ✅ Display sentiment analysis results

## Manual Testing

Nếu muốn lấy Order ID thủ công:

```powershell
# Get test order info
curl http://localhost:8080/api/test/order

# Response:
# {
#   "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
#   "trackingNumber": "VNTEST12345VN",
#   "senderName": "Nguyễn Văn A",
#   "receiverName": "Trần Thị B",
#   "status": "CREATED"
# }
```

## Notes

- Endpoint `/api/test/order` không cần authentication
- Test order chỉ được tạo 1 lần khi khởi động
- Nếu order đã tồn tại, sẽ log ra ID của order cũ
