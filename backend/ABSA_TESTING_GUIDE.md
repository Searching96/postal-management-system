# ABSA Testing Guide

## Prerequisites
1. ABSA Flask service đang chạy tại http://localhost:5000
2. Spring Boot backend đang chạy tại http://localhost:8080
3. Database đã có dữ liệu: order, customer với account

## Bước 1: Kiểm tra ABSA Service

### 1.1. Check ABSA service health
```bash
curl http://localhost:5000/health
```

Kết quả mong đợi:
```json
{"status": "healthy"}
```

### 1.2. Check batch status
```bash
curl http://localhost:5000/api/batch/status
```

Kết quả mong đợi:
```json
{
  "current_count": 0,
  "threshold": 128,
  "oldest_timestamp": null
}
```

## Bước 2: Login và lấy Token

### 2.1. Login với customer account
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"customer1\",\"password\":\"password123\"}"
```

**Lưu lại token từ response** để dùng cho các request sau.

Hoặc dùng PowerShell:
```powershell
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"customer1","password":"password123"}'

$token = $loginResponse.accessToken
Write-Host "Token: $token"
```

## Bước 3: Tạo Comment và Test Flow

### 3.1. Tạo comment cho một order (CMD)
```bash
curl -X POST http://localhost:8080/api/orders/{orderId}/comments ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"commentText\":\"Dịch vụ bưu điện rất nhanh chóng, nhân viên nhiệt tình và thân thiện. Giá cả hợp lý, chất lượng tốt.\"}"
```

**PowerShell:**
```powershell
$orderId = "YOUR_ORDER_ID"  # Replace với order ID thật
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    commentText = "Dịch vụ bưu điện rất nhanh chóng, nhân viên nhiệt tình và thân thiện. Giá cả hợp lý, chất lượng tốt."
} | ConvertTo-Json

$commentResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/$orderId/comments" `
  -Method Post `
  -Headers $headers `
  -Body $body

Write-Host "Comment created:"
$commentResponse | ConvertTo-Json -Depth 5
```

### 3.2. Check Spring Boot logs
Kiểm tra console của Spring Boot, bạn sẽ thấy:
```
INFO  o.f.p.s.impl.OrderServiceImpl - Creating new comment for order XXX by sender (customer1)
INFO  o.f.p.s.impl.ABSAServiceImpl - Sending comment <uuid> to ABSA for analysis
INFO  o.f.p.s.impl.ABSAServiceImpl - Successfully sent comment <uuid> to ABSA
```

### 3.3. Check ABSA Flask logs
Check logs của Flask service:
```bash
docker logs postal-comment-api -f
```

Hoặc nếu chạy trực tiếp:
```bash
# Check terminal đang chạy Flask
```

Sẽ thấy:
```
INFO: Received comment: <uuid>
INFO: Added to Redis buffer: <uuid>
INFO: Current buffer count: 1/128
```

### 3.4. Check Redis buffer
```bash
curl http://localhost:5000/api/batch/status
```

Kết quả:
```json
{
  "current_count": 1,
  "threshold": 128,
  "oldest_timestamp": "2026-01-18T10:00:00"
}
```

### 3.5. Lấy comment vừa tạo
```bash
curl http://localhost:8080/api/orders/{orderId}/comments ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**PowerShell:**
```powershell
$getComment = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/$orderId/comments" `
  -Method Get `
  -Headers $headers

Write-Host "Current comment status:"
$getComment | ConvertTo-Json -Depth 5
```

Kết quả sẽ có:
```json
{
  "id": "...",
  "commentText": "...",
  "absaStatus": "processing",
  "absaTimeAspect": null,
  "absaStaffAspect": null,
  "absaQualityAspect": null,
  "absaPriceAspect": null
}
```

## Bước 4: Trigger Batch Analysis (không đợi 128 comments)

### 4.1. Manual trigger (CMD)
```bash
curl -X POST http://localhost:8080/api/absa/trigger-batch ^
  -H "Authorization: Bearer YOUR_MANAGER_TOKEN_HERE"
```

**PowerShell:**
```powershell
# Login với manager account
$managerLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"manager1","password":"password123"}'

$managerToken = $managerLogin.accessToken

# Trigger batch
$managerHeaders = @{
    "Authorization" = "Bearer $managerToken"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/absa/trigger-batch" `
  -Method Post `
  -Headers $managerHeaders
```

HOẶC trigger trực tiếp từ Flask:
```bash
curl -X POST http://localhost:5000/api/batch/fill ^
  -H "Content-Type: application/json" ^
  -d "{}"
```

### 4.2. Check ABSA processing
Flask logs sẽ show:
```
INFO: Starting batch inference for 1 comments
INFO: Loading PhoBERT model...
INFO: Processing batch...
INFO: Inference completed
INFO: Sending callback to http://localhost:8080/api/absa/callback
```

### 4.3. Check Spring Boot callback logs
```
INFO  o.f.p.c.ABSAController - Received ABSA callback: {order_comment_id=..., status=success, aspects={...}}
INFO  o.f.p.s.impl.ABSAServiceImpl - Processing ABSA result for comment <uuid>: status=success
INFO  o.f.p.s.impl.ABSAServiceImpl - ABSA analysis completed for comment <uuid>: time=positive, staff=positive, quality=positive, price=neutral
```

## Bước 5: Verify Result

### 5.1. Get comment với ABSA result (CMD)
```bash
curl http://localhost:8080/api/orders/{orderId}/comments ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**PowerShell:**
```powershell
Start-Sleep -Seconds 5  # Đợi callback xử lý xong

$finalComment = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/$orderId/comments" `
  -Method Get `
  -Headers $headers

Write-Host "`nFinal ABSA Result:"
Write-Host "Status: $($finalComment.absaStatus)"
Write-Host "Time Aspect: $($finalComment.absaTimeAspect)"
Write-Host "Staff Aspect: $($finalComment.absaStaffAspect)"
Write-Host "Quality Aspect: $($finalComment.absaQualityAspect)"
Write-Host "Price Aspect: $($finalComment.absaPriceAspect)"
Write-Host "Analyzed At: $($finalComment.absaAnalyzedAt)"
```

Kết quả mong đợi:
```json
{
  "id": "...",
  "commentText": "Dịch vụ bưu điện rất nhanh chóng, nhân viên nhiệt tình...",
  "absaStatus": "success",
  "absaTimeAspect": "positive",
  "absaStaffAspect": "positive",
  "absaQualityAspect": "positive",
  "absaPriceAspect": "neutral",
  "absaAnalyzedAt": "2026-01-18T10:05:30"
}
```

### 5.2. Get result từ ABSA endpoint
```bash
curl http://localhost:8080/api/absa/results/{commentId} ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**PowerShell:**
```powershell
$commentId = $commentResponse.id

$absaResult = Invoke-RestMethod -Uri "http://localhost:8080/api/absa/results/$commentId" `
  -Method Get `
  -Headers $headers

Write-Host "`nABSA Result from dedicated endpoint:"
$absaResult | ConvertTo-Json -Depth 5
```

## Bước 6: Test với nhiều comments

### 6.1. PowerShell script để test batch
```powershell
# Test comments với sentiment khác nhau
$testComments = @(
    "Giao hàng chậm quá, nhân viên thái độ không tốt",
    "Dịch vụ bình thường, không có gì đặc biệt",
    "Rất hài lòng với chất lượng, giá cả phải chăng",
    "Nhân viên rất nhiệt tình nhưng giá hơi cao",
    "Giao hàng đúng hẹn, đóng gói cẩn thận"
)

foreach ($commentText in $testComments) {
    $body = @{
        commentText = $commentText
    } | ConvertTo-Json
    
    Write-Host "Creating comment: $commentText"
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/$orderId/comments" `
          -Method Post `
          -Headers $headers `
          -Body $body
        
        Write-Host "  Created: $($response.id)" -ForegroundColor Green
    }
    catch {
        Write-Host "  Error: $_" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 2
}

Write-Host "`nCreated $($testComments.Count) comments. Trigger batch analysis..."

# Trigger batch
Invoke-RestMethod -Uri "http://localhost:8080/api/absa/trigger-batch" `
  -Method Post `
  -Headers $managerHeaders

Write-Host "Waiting for analysis..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Check results..." -ForegroundColor Cyan
```

## Troubleshooting

### ABSA service không nhận được request
1. Check network: `curl http://localhost:5000/health`
2. Check application.yml config: `absa.api.url`
3. Check firewall/antivirus

### Callback không về
1. Check callback URL: `absa.callback.url` trong application.yml
2. Nếu Spring Boot chạy local và Flask trong Docker: dùng `http://host.docker.internal:8080`
3. Nếu cả hai chạy local: dùng `http://localhost:8080`

### absaStatus = "error"
1. Check Flask logs để xem error message
2. Verify comment encoding (phải UTF-8)
3. Check PhoBERT model đã load đúng

### Comment không được gửi tới ABSA
1. Check logs: "Sending comment {} to ABSA for analysis"
2. Check WebClient connection
3. Verify ABSA API URL

## Complete PowerShell Test Script

Lưu file này làm `test-absa.ps1`:

```powershell
# Configuration
$baseUrl = "http://localhost:8080"
$absaUrl = "http://localhost:5000"

# Step 1: Check ABSA service
Write-Host "=== Step 1: Checking ABSA Service ===" -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$absaUrl/health"
    Write-Host "ABSA Service: OK" -ForegroundColor Green
}
catch {
    Write-Host "ABSA Service: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Login
Write-Host "`n=== Step 2: Login ===" -ForegroundColor Cyan
$loginBody = @{
    username = "customer1"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
      -Method Post `
      -ContentType "application/json" `
      -Body $loginBody
    
    $token = $loginResponse.accessToken
    Write-Host "Login successful! Token: $($token.Substring(0, 20))..." -ForegroundColor Green
}
catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Step 3: Get an order ID (replace with actual order ID)
$orderId = Read-Host "Enter Order ID"

# Step 4: Create comment
Write-Host "`n=== Step 3: Creating Comment ===" -ForegroundColor Cyan
$commentBody = @{
    commentText = "Dịch vụ bưu điện rất nhanh chóng, nhân viên nhiệt tình và thân thiện. Giá cả hợp lý, chất lượng tốt."
} | ConvertTo-Json

try {
    $commentResponse = Invoke-RestMethod -Uri "$baseUrl/api/orders/$orderId/comments" `
      -Method Post `
      -Headers $headers `
      -Body $commentBody
    
    Write-Host "Comment created successfully!" -ForegroundColor Green
    Write-Host "  ID: $($commentResponse.id)"
    Write-Host "  ABSA Status: $($commentResponse.absaStatus)"
}
catch {
    Write-Host "Failed to create comment: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Check batch status
Write-Host "`n=== Step 4: Checking Batch Status ===" -ForegroundColor Cyan
$batchStatus = Invoke-RestMethod -Uri "$absaUrl/api/batch/status"
Write-Host "Buffer count: $($batchStatus.current_count)/$($batchStatus.threshold)"

# Step 6: Trigger batch analysis
Write-Host "`n=== Step 5: Triggering Batch Analysis ===" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "$absaUrl/api/batch/fill" `
      -Method Post `
      -ContentType "application/json" `
      -Body "{}"
    
    Write-Host "Batch triggered successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Failed to trigger batch: $_" -ForegroundColor Red
}

# Step 7: Wait and check result
Write-Host "`n=== Step 6: Waiting for Analysis... ===" -ForegroundColor Cyan
Write-Host "Waiting 10 seconds for analysis to complete..."
Start-Sleep -Seconds 10

Write-Host "`n=== Step 7: Checking Result ===" -ForegroundColor Cyan
try {
    $finalComment = Invoke-RestMethod -Uri "$baseUrl/api/orders/$orderId/comments" `
      -Method Get `
      -Headers $headers
    
    Write-Host "`nFinal ABSA Result:" -ForegroundColor Green
    Write-Host "  Status: $($finalComment.absaStatus)"
    Write-Host "  Time Aspect: $($finalComment.absaTimeAspect)"
    Write-Host "  Staff Aspect: $($finalComment.absaStaffAspect)"
    Write-Host "  Quality Aspect: $($finalComment.absaQualityAspect)"
    Write-Host "  Price Aspect: $($finalComment.absaPriceAspect)"
    Write-Host "  Analyzed At: $($finalComment.absaAnalyzedAt)"
}
catch {
    Write-Host "Failed to get result: $_" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
```

Chạy script:
```powershell
.\test-absa.ps1
```
