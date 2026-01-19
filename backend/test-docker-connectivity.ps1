# Test Docker to Host Connectivity
# This script tests if Docker containers can reach Spring Boot on host

Write-Host "=== Testing Docker to Host Connectivity ===" -ForegroundColor Cyan

# 1. Check if Spring Boot is running
Write-Host "`n[1] Checking Spring Boot on host..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "    ✅ Spring Boot is running on localhost:8080" -ForegroundColor Green
}
catch {
    Write-Host "    ❌ Spring Boot NOT accessible on localhost:8080" -ForegroundColor Red
    Write-Host "    Make sure Spring Boot is running: .\mvnw.cmd spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# 2. Check if Flask ABSA service is running
Write-Host "`n[2] Checking Flask ABSA service..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "    ✅ Flask ABSA service is running on localhost:5000" -ForegroundColor Green
}
catch {
    Write-Host "    ❌ Flask ABSA service NOT accessible on localhost:5000" -ForegroundColor Red
    Write-Host "    Make sure ABSA service is running (Docker or local)" -ForegroundColor Yellow
    exit 1
}

# 3. Test host.docker.internal from PowerShell (simulates what container sees)
Write-Host "`n[3] Testing host.docker.internal resolution..."
try {
    $response = Invoke-WebRequest -Uri "http://host.docker.internal:8080/actuator/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "    ✅ host.docker.internal:8080 is accessible" -ForegroundColor Green
}
catch {
    Write-Host "    ⚠️  host.docker.internal:8080 NOT accessible from PowerShell" -ForegroundColor Yellow
    Write-Host "    This might be normal if not running in WSL/Docker Desktop context" -ForegroundColor Gray
    Write-Host "    The important test is if Docker container can reach it" -ForegroundColor Gray
}

# 4. Test callback endpoint accessibility (without actual data)
Write-Host "`n[4] Testing callback endpoint accessibility..."
try {
    # Just test if endpoint exists using OPTIONS or HEAD
    # Don't send actual test data to avoid log pollution
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/absa/callback" `
        -Method OPTIONS `
        -TimeoutSec 3 `
        -ErrorAction Stop

    Write-Host "    ✅ Callback endpoint is accessible" -ForegroundColor Green
}
catch {
    # Endpoint exists if we get 403, 405 (Method Not Allowed), or 200
    if ($_.Exception.Response.StatusCode.value__ -in @(200, 403, 405)) {
        Write-Host "    ✅ Callback endpoint exists (server responded)" -ForegroundColor Green
    }
    else {
        Write-Host "    ℹ️  Callback endpoint status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Gray
        Write-Host "    This is okay - endpoint will be tested during actual ABSA flow" -ForegroundColor Gray
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Next steps:"
Write-Host "1. Restart Spring Boot to apply new config"
Write-Host "2. Run test script: .\test-absa-simple.ps1 -Username '0901234567' -Password '123456'"
Write-Host "3. Check Flask logs to see if callback succeeds with host.docker.internal"
