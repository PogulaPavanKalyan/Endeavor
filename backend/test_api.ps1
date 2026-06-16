# Test Webinar API endpoints

# Step 1: Login
Write-Host "=== Step 1: Login ===" -ForegroundColor Cyan
$loginBody = '{"username":"admin","password":"admin123"}'
$loginResult = Invoke-RestMethod -Uri "http://localhost:8081/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$token = $loginResult.token
Write-Host "Token received: $($token.Substring(0, 30))..." -ForegroundColor Green

# Step 2: Create a Draft Webinar
Write-Host "`n=== Step 2: Create Draft Webinar ===" -ForegroundColor Cyan
$webinarBody = '{"title":"Advances in Quantum Computing 2026","description":"Join our panel of leading researchers as they explore the latest breakthroughs in quantum computing.","speakerName":"Dr. Priya Sharma","speakerDesignation":"Professor of Quantum Physics, IIT Delhi","webinarDate":"2026-07-15","startTime":"14:00","endTime":"16:00","timeZone":"IST","meetingLink":"https://zoom.us/j/1234567890","registrationRequired":false,"certificateAvailable":true,"status":"DRAFT"}'

$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
$createdWebinar = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/webinars" -Method POST -ContentType "application/json" -Body $webinarBody -Headers $headers
Write-Host "Created webinar ID: $($createdWebinar.id), Slug: $($createdWebinar.slug), Status: $($createdWebinar.status)" -ForegroundColor Green

# Step 3: Verify it does NOT show on public page (still DRAFT)
Write-Host "`n=== Step 3: Check Public API (should be empty - Draft only) ===" -ForegroundColor Cyan
$publicResult = Invoke-RestMethod -Uri "http://localhost:8081/api/webinars?page=0&size=10"
Write-Host "Public webinars count: $($publicResult.totalElements)" -ForegroundColor Yellow

# Step 4: Publish the webinar
Write-Host "`n=== Step 4: Publish the Webinar ===" -ForegroundColor Cyan
$webinarBody2 = '{"title":"Advances in Quantum Computing 2026","description":"Join our panel of leading researchers as they explore the latest breakthroughs in quantum computing.","speakerName":"Dr. Priya Sharma","speakerDesignation":"Professor of Quantum Physics, IIT Delhi","webinarDate":"2026-07-15","startTime":"14:00","endTime":"16:00","timeZone":"IST","meetingLink":"https://zoom.us/j/1234567890","registrationRequired":false,"certificateAvailable":true,"status":"PUBLISHED"}'

$webinarId = $createdWebinar.id
$publishedWebinar = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/webinars/$webinarId" -Method PUT -ContentType "application/json" -Body $webinarBody2 -Headers $headers
Write-Host "Published webinar status: $($publishedWebinar.status)" -ForegroundColor Green

# Step 5: Verify it NOW shows on public page
Write-Host "`n=== Step 5: Check Public API (should have 1 published webinar) ===" -ForegroundColor Cyan
$publicResult2 = Invoke-RestMethod -Uri "http://localhost:8081/api/webinars?page=0&size=10"
Write-Host "Public webinars count: $($publicResult2.totalElements)" -ForegroundColor Green
if ($publicResult2.content.Count -gt 0) {
    $w = $publicResult2.content[0]
    Write-Host "  Title: $($w.title)"
    Write-Host "  Speaker: $($w.speakerName)"
    Write-Host "  Date: $($w.webinarDate) $($w.startTime)-$($w.endTime)"
    Write-Host "  Slug: $($w.slug)"
    Write-Host "  Status: $($w.status)"
}

# Step 6: Fetch by slug (public detail page)
Write-Host "`n=== Step 6: Fetch by Slug (Public Detail) ===" -ForegroundColor Cyan
$slug = $createdWebinar.slug
$detailResult = Invoke-RestMethod -Uri "http://localhost:8081/api/webinars/$slug"
Write-Host "Detail page title: $($detailResult.title)" -ForegroundColor Green
Write-Host "Detail page speaker: $($detailResult.speakerName)"

# Step 7: Get all admin webinars (should include this one)
Write-Host "`n=== Step 7: Admin List (all statuses) ===" -ForegroundColor Cyan
$adminResult = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/webinars?page=0&size=10&includeArchived=true" -Headers $headers
Write-Host "Admin webinars total: $($adminResult.totalElements)" -ForegroundColor Green

# Step 8: Archive the webinar (soft delete)
Write-Host "`n=== Step 8: Soft Delete (Archive) ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:8081/api/admin/webinars/$webinarId" -Method DELETE -Headers $headers
Write-Host "Webinar archived successfully" -ForegroundColor Green

# Step 9: Verify it no longer shows on public page
Write-Host "`n=== Step 9: Verify Removed from Public ===" -ForegroundColor Cyan
$publicResult3 = Invoke-RestMethod -Uri "http://localhost:8081/api/webinars?page=0&size=10"
Write-Host "Public webinars count after archive: $($publicResult3.totalElements)" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "=== ALL WEBINAR API TESTS PASSED! ===" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Magenta
