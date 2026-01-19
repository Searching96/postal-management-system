# Simple ABSA Test Script
# Usage: .\test-absa-simple.ps1 -OrderId "your-order-uuid"

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$AbsaUrl = "http://localhost:5000",
    [string]$Username = "customer1",
    [string]$Password = "password123",
    [string]$OrderId = ""
)

Write-Host "`n=== ABSA Integration Test ==="

# Step 1: Check ABSA Service
Write-Host "`n[1] Checking ABSA Service..."
try {
    $health = Invoke-RestMethod -Uri "$AbsaUrl/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "    OK: ABSA Service is running"
}
catch {
    Write-Host "    ERROR: ABSA Service not available at $AbsaUrl"
    Write-Host "    $($_.Exception.Message)"
    exit 1
}

# Step 2: Check Spring Boot (optional - might not have actuator)
Write-Host "`n[2] Checking Spring Boot..."
try {
    # Try actuator first
    $actuator = Invoke-RestMethod -Uri "$BaseUrl/actuator/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "    OK: Spring Boot is running"
}
catch {
    Write-Host "    Note: Actuator not available, trying basic endpoint..."
    # Try a basic API endpoint instead
    try {
        $null = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" -Method Get -TimeoutSec 3 -ErrorAction Stop
        Write-Host "    OK: Spring Boot is running"
    }
    catch {
        # Even 405 or 401 means the service is running
        if ($_.Exception.Response.StatusCode -eq 405 -or $_.Exception.Response.StatusCode -eq 401) {
            Write-Host "    OK: Spring Boot is running"
        }
        else {
            Write-Host "    WARNING: Cannot confirm Spring Boot status at $BaseUrl"
            Write-Host "    Continuing anyway... (make sure your Spring Boot is running)"
        }
    }
}

# Step 3: Login
Write-Host "`n[3] Logging in as $Username..."
$loginBody = @{
    username = $Username
    password = $Password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -ErrorAction Stop
    $token = $loginResponse.data.token
    Write-Host "    OK: Login successful"
}
catch {
    Write-Host "    ERROR: Login failed"
    Write-Host "    $($_.Exception.Message)"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Step 4: Get Test Order ID
if ([string]::IsNullOrEmpty($OrderId)) {
    Write-Host "`n[4] Fetching test order..."
    try {
        $testOrder = Invoke-RestMethod -Uri "$BaseUrl/api/test/order" -Method Get -ErrorAction Stop
        $OrderId = $testOrder.id
        Write-Host "    OK: Found test order"
        Write-Host "    Tracking Number: $($testOrder.trackingNumber)"
        Write-Host "    Order ID: $OrderId"
    }
    catch {
        Write-Host "    ERROR: Cannot get test order"
        Write-Host "    $($_.Exception.Message)"
        Write-Host "`nPlease enter Order ID manually:"
        $OrderId = Read-Host
        if ([string]::IsNullOrEmpty($OrderId)) {
            Write-Host "ERROR: Order ID required"
            exit 1
        }
    }
}
else {
    Write-Host "`n[4] Using provided Order ID: $OrderId"
}

# Step 5: Verify Order
Write-Host "`n[5] Verifying order..."
try {
    # Use tracking endpoint instead (public, no auth required)
    $order = Invoke-RestMethod -Uri "$BaseUrl/api/orders/track/VNTEST12345VN" -Method Get -ErrorAction Stop
    Write-Host "    OK: Order found - $($order.trackingNumber)"
    Write-Host "    Sender: $($order.senderName)"
    Write-Host "    Status: $($order.status)"
}
catch {
    Write-Host "    ERROR: Order not found"
    Write-Host "    $($_.Exception.Message)"
    exit 1
}

# Step 6: Create Comment
Write-Host "`n[6] Creating comment..."
$commentText = "Dịch vụ bưu điện rất nhanh chóng, nhân viên nhiệt tình và thân thiện. Giá cả hợp lý, chất lượng tốt."
$commentBody = @{
    commentText = $commentText
} | ConvertTo-Json

# Convert to UTF-8 bytes to ensure proper encoding
$commentBodyBytes = [System.Text.Encoding]::UTF8.GetBytes($commentBody)

Write-Host "    Debug: Token length = $($token.Length)"
Write-Host "    Debug: Token preview = Bearer $($token.Substring(0, [Math]::Min(30, $token.Length)))..."
Write-Host "    Debug: Calling POST $BaseUrl/api/orders/$OrderId/comment"

try {
    $commentResponse = Invoke-RestMethod `
        -Uri "$BaseUrl/api/orders/$OrderId/comment" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json; charset=utf-8"
        } `
        -Body $commentBodyBytes `
        -ErrorAction Stop
    
    $commentId = $commentResponse.id
    Write-Host "    OK: Comment created"
    Write-Host "    Comment ID: $commentId"
    Write-Host "    Initial ABSA Status: $($commentResponse.absaStatus)"
}
catch {
    Write-Host "    ERROR: Failed to create comment"
    Write-Host "    Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "    Message: $($_.Exception.Message)"
    
    Write-Host "    Note: Trying to fetch existing comment..."
    try {
        $existingComment = Invoke-RestMethod `
            -Uri "$BaseUrl/api/orders/$OrderId/comment" `
            -Method Get `
            -Headers @{
                "Authorization" = "Bearer $token"
                "Content-Type" = "application/json"
            } `
            -ErrorAction Stop
        
        $commentId = $existingComment.id
        Write-Host "    Found existing comment ID: $commentId"
        Write-Host "    Current ABSA Status: $($existingComment.absaStatus)"
    }
    catch {
        Write-Host "    ERROR: Cannot fetch comment either"
        Write-Host "    Status: $($_.Exception.Response.StatusCode.value__)"
        Write-Host "    Message: $($_.Exception.Message)"
        exit 1
    }
}

# Step 7: Check batch status
Write-Host "`n[7] Checking ABSA buffer status..."
try {
    $batchStatus = Invoke-RestMethod -Uri "$AbsaUrl/api/batch/status" -ErrorAction Stop
    Write-Host "    Buffer: $($batchStatus.current_count)/$($batchStatus.threshold) comments"
}
catch {
    Write-Host "    Warning: Cannot check batch status"
}

# Step 8: Trigger batch
Write-Host "`n[8] Triggering batch analysis via Spring Boot API..."
try {
    $triggerResult = Invoke-RestMethod -Uri "$BaseUrl/api/absa/trigger-batch" -Method Post -ContentType "application/json" -ErrorAction Stop
    Write-Host "    OK: Batch triggered"
    Write-Host "    Response: $triggerResult"
}
catch {
    Write-Host "    Warning: Cannot trigger batch via Spring Boot"
    Write-Host "    Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "    Error: $($_.Exception.Message)"
    
    # Fallback to direct Flask API call
    Write-Host "    Trying direct Flask API call..."
    try {
        $directResult = Invoke-RestMethod -Uri "$AbsaUrl/api/batch/fill" -Method Post -ContentType "application/json" -Body '{"filler_text":"FILLER_IGNORE"}' -ErrorAction Stop
        Write-Host "    OK: Direct Flask call succeeded"
        Write-Host "    Response: $directResult"
    }
    catch {
        Write-Host "    Error: Direct Flask call also failed: $($_.Exception.Message)"
    }
}

# Step 9: Wait
Write-Host "`n[9] Waiting for PhoBERT analysis (10 seconds)..."
for ($i = 30; $i -gt 0; $i--) {
    Write-Host "    $i..."
    Start-Sleep -Seconds 1
}

# Step 10: Get Result
Write-Host "`n[10] Fetching analysis result..."
try {
    $finalComment = Invoke-RestMethod -Uri "$BaseUrl/api/orders/$OrderId/comment" -Method Get -Headers $headers -ErrorAction Stop
    
    Write-Host "`n========================================"
    Write-Host "ABSA ANALYSIS RESULT"
    Write-Host "========================================"
    Write-Host "Comment ID    : $($finalComment.id)"
    Write-Host "Status        : $($finalComment.absaStatus)"
    Write-Host ""
    Write-Host "ASPECTS (not_mentioned=-1, negative=0, neutral=1, positive=2):"
    Write-Host "  Time        : $($finalComment.absaTimeAspect)"
    Write-Host "  Staff       : $($finalComment.absaStaffAspect)"
    Write-Host "  Quality     : $($finalComment.absaQualityAspect)"
    Write-Host "  Price       : $($finalComment.absaPriceAspect)"
    Write-Host ""
    Write-Host "Analyzed At   : $($finalComment.absaAnalyzedAt)"
    Write-Host "========================================"
    
    # Show raw response for debugging
    Write-Host "`nRAW RESPONSE (for debugging):"
    Write-Host "absaStatus: $($finalComment.absaStatus)"
    Write-Host "absaTimeAspect: $($finalComment.absaTimeAspect)"
    Write-Host "absaStaffAspect: $($finalComment.absaStaffAspect)"
    Write-Host "absaQualityAspect: $($finalComment.absaQualityAspect)"
    Write-Host "absaPriceAspect: $($finalComment.absaPriceAspect)"
    Write-Host "absaAnalyzedAt: $($finalComment.absaAnalyzedAt)"
    
    if ($finalComment.absaStatus -eq "success") {
        Write-Host "`nTEST PASSED: ABSA integration working!"
    }
    elseif ($finalComment.absaStatus -eq "processing") {
        Write-Host "`nNote: Analysis still processing, wait longer and check again"
    }
    else {
        Write-Host "`nNote: Analysis may have failed, check ABSA logs"
    }
}
catch {
    Write-Host "ERROR: Cannot fetch result"
    Write-Host "$($_.Exception.Message)"
}

Write-Host "`n=== Test Complete ==="
Write-Host ""
