param(
    [string]$Username = "0901234567",
    [string]$Password = "123456"
)

$baseUrl = "http://localhost:8080"
$absaUrl = "http://localhost:5000"

Write-Host "`n=== ABSA Multiple Comments Test ===" -ForegroundColor Cyan

# Test comments with clear sentiments
$testComments = @(
    @{
        text = "Dịch vụ bưu điện rất nhanh chóng và chuyên nghiệp. Nhân viên thân thiện, giá cả hợp lý."
        description = "All positive"
    },
    @{
        text = "Giao hàng chậm quá! Nhân viên thái độ tệ và giá quá đắt."
        description = "All negative"
    },
    @{
        text = "Thời gian giao hàng nhanh nhưng nhân viên không thân thiện lắm."
        description = "Mixed: time positive, staff negative"
    },
    @{
        text = "Giá cả phải chăng, chất lượng dịch vụ tốt."
        description = "Price positive, quality positive"
    },
    @{
        text = "Bưu điện bình thường, không có gì đặc biệt."
        description = "Neutral"
    },
    @{
        text = "Thời gian giao hàng quá lâu, đợi mãi mới nhận được."
        description = "Time negative"
    },
    @{
        text = "Nhân viên rất nhiệt tình, chu đáo và giúp đỡ nhiệt tình."
        description = "Staff very positive"
    },
    @{
        text = "Giá quá cao so với chất lượng dịch vụ thấp kém."
        description = "Price negative, quality negative"
    }
)

# Step 1: Check services
Write-Host "`n[1] Checking services..." -ForegroundColor Yellow
try {
    $null = Invoke-RestMethod -Uri "$absaUrl/health" -Method Get -TimeoutSec 3
    Write-Host "    OK: ABSA Service running" -ForegroundColor Green
} catch {
    Write-Host "    ERROR: ABSA Service not running!" -ForegroundColor Red
    exit 1
}

try {
    $null = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method Get -TimeoutSec 3
    Write-Host "    OK: Spring Boot running" -ForegroundColor Green
} catch {
    Write-Host "    ERROR: Spring Boot not running!" -ForegroundColor Red
    exit 1
}

# Step 2: Login
Write-Host "`n[2] Logging in as $Username..." -ForegroundColor Yellow
$loginBody = @{
    phoneNumber = $Username
    password = $Password
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
    -Method Post `
    -Body $loginBody `
    -ContentType "application/json; charset=utf-8"

$token = "Bearer " + $loginResponse.token
Write-Host "    OK: Login successful" -ForegroundColor Green

# Step 3: Create test orders and comments
Write-Host "`n[3] Creating orders and comments..." -ForegroundColor Yellow
$commentIds = @()

foreach ($i in 0..($testComments.Count - 1)) {
    $comment = $testComments[$i]
    $commentText = $comment.text
    
    Write-Host "    [$($i+1)/$($testComments.Count)] $($comment.description)" -ForegroundColor Cyan
    
    # Create new order
    $trackingNum = "ABSA$(Get-Random -Minimum 10000 -Maximum 99999)VN"
    $orderBody = @{
        senderPhoneNumber = "0901234567"
        recipientPhoneNumber = "0987654321"
        recipientName = "Test Recipient $($i+1)"
        recipientAddress = "123 Test St"
        provinceId = "01"
        districtId = "001"
        wardId = "00001"
        contentDescription = "Test package for ABSA $($i+1)"
        weight = 1.5
        length = 20
        width = 15
        height = 10
        declaredValue = 100000
        cashOnDelivery = 0
        serviceTypeId = 1
        trackingNumber = $trackingNum
    } | ConvertTo-Json
    
    try {
        $orderResponse = Invoke-RestMethod `
            -Uri "$baseUrl/api/orders" `
            -Method Post `
            -Headers @{ 
                Authorization = $token
                "Content-Type" = "application/json; charset=utf-8"
            } `
            -Body ([System.Text.Encoding]::UTF8.GetBytes($orderBody))
        
        $orderId = $orderResponse.id
        Write-Host "        Order created: $trackingNum ($orderId)" -ForegroundColor Gray
        
        # Create comment for this order
        $commentBody = @{
            commentText = $commentText
            rating = 5
        } | ConvertTo-Json
        
        $commentResponse = Invoke-RestMethod `
            -Uri "$baseUrl/api/orders/$orderId/comment" `
            -Method Post `
            -Headers @{ 
                Authorization = $token
                "Content-Type" = "application/json; charset=utf-8"
            } `
            -Body ([System.Text.Encoding]::UTF8.GetBytes($commentBody))
        
        $commentIds += @{
            id = $commentResponse.id
            orderId = $orderId
            trackingNumber = $trackingNum
            text = $commentText
            description = $comment.description
        }
        
        Write-Host "        Comment created: $($commentResponse.id)" -ForegroundColor Green
    } catch {
        Write-Host "        ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 300
}

Write-Host "    Total created: $($commentIds.Count) orders with comments" -ForegroundColor Green

# Step 4: Trigger batch analysis
Write-Host "`n[4] Triggering batch analysis..." -ForegroundColor Yellow
$triggerResponse = Invoke-RestMethod `
    -Uri "$baseUrl/api/absa/trigger-batch" `
    -Method Post `
    -Headers @{ Authorization = $token }

Write-Host "    OK: Batch triggered" -ForegroundColor Green
Write-Host "    Filled: $($triggerResponse.filled_count) comments" -ForegroundColor Gray

# Step 5: Wait for analysis
Write-Host "`n[5] Waiting for PhoBERT analysis (15 seconds)..." -ForegroundColor Yellow
for ($i = 15; $i -gt 0; $i--) {
    Write-Host "    $i..." -NoNewline
    Start-Sleep -Seconds 1
}
Write-Host ""

# Step 6: Fetch results
Write-Host "`n[6] Fetching analysis results..." -ForegroundColor Yellow
Write-Host ("=" * 80) -ForegroundColor Cyan

foreach ($i in 0..($commentIds.Count - 1)) {
    $commentInfo = $commentIds[$i]
    $commentId = $commentInfo.id
    $orderId = $commentInfo.orderId
    
    Write-Host "`n[$($i+1)/$($commentIds.Count)] $($commentInfo.description)" -ForegroundColor Yellow
    Write-Host "Tracking: $($commentInfo.trackingNumber)" -ForegroundColor Gray
    Write-Host "Text: $($commentInfo.text)" -ForegroundColor Gray
    
    try {
        $orderDetail = Invoke-RestMethod `
            -Uri "$baseUrl/api/orders/$orderId" `
            -Method Get `
            -Headers @{ Authorization = $token }
        
        $commentResult = $orderDetail.comments | Where-Object { $_.id -eq $commentId }
        
        if ($commentResult) {
            Write-Host "Status: $($commentResult.absaStatus)" -ForegroundColor $(
                if ($commentResult.absaStatus -eq "success") { "Green" } else { "Red" }
            )
            
            # Function to colorize aspect
            function Get-AspectColor($aspect) {
                switch ($aspect) {
                    "positive" { "Green" }
                    "negative" { "Red" }
                    "neutral" { "Yellow" }
                    "not_mentioned" { "Gray" }
                    default { "White" }
                }
            }
            
            Write-Host "Aspects:" -ForegroundColor White
            Write-Host "  Time   : " -NoNewline; Write-Host $commentResult.absaTimeAspect -ForegroundColor (Get-AspectColor $commentResult.absaTimeAspect)
            Write-Host "  Staff  : " -NoNewline; Write-Host $commentResult.absaStaffAspect -ForegroundColor (Get-AspectColor $commentResult.absaStaffAspect)
            Write-Host "  Quality: " -NoNewline; Write-Host $commentResult.absaQualityAspect -ForegroundColor (Get-AspectColor $commentResult.absaQualityAspect)
            Write-Host "  Price  : " -NoNewline; Write-Host $commentResult.absaPriceAspect -ForegroundColor (Get-AspectColor $commentResult.absaPriceAspect)
            
            # Verify if aspects match expectations
            $hasPositive = @($commentResult.absaTimeAspect, $commentResult.absaStaffAspect, 
                            $commentResult.absaQualityAspect, $commentResult.absaPriceAspect) -contains "positive"
            $hasNegative = @($commentResult.absaTimeAspect, $commentResult.absaStaffAspect, 
                            $commentResult.absaQualityAspect, $commentResult.absaPriceAspect) -contains "negative"
            
            if ($hasPositive -or $hasNegative) {
                Write-Host "[OK] Sentiment detected!" -ForegroundColor Green
            } else {
                Write-Host "[WARN] No clear sentiment detected" -ForegroundColor Yellow
            }
        } else {
            Write-Host "ERROR: Comment not found in order details" -ForegroundColor Red
        }
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
