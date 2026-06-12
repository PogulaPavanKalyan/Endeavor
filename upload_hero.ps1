# Step 1: Login
$loginBody = '{"username":"admin","password":"admin123"}'
try {
    $resp = Invoke-RestMethod -Method POST -Uri "http://localhost:8081/auth/login" `
        -ContentType "application/json" -Body $loginBody -ErrorAction Stop
    $token = $resp.token
    Write-Host "LOGIN SUCCESS - Token: $token"
} catch {
    Write-Host "LOGIN FAILED: $_"
    # Try other credentials
    $loginBody2 = '{"username":"pavan","password":"pavan@1"}'
    try {
        $resp = Invoke-RestMethod -Method POST -Uri "http://localhost:8081/auth/login" `
            -ContentType "application/json" -Body $loginBody2 -ErrorAction Stop
        $token = $resp.token
        Write-Host "LOGIN2 SUCCESS - Token: $token"
    } catch {
        Write-Host "LOGIN2 ALSO FAILED: $_"
        exit 1
    }
}

if (-not $token) { Write-Host "No token!"; exit 1 }

# Step 2: Create hero banner
$heroBody = '{"title":"Advancing Global Research Through Innovation","subtitle":"International Conferences & Publications","description":"Join researchers, scientists, and industry leaders from 50+ countries to share knowledge, present research, and shape the future of science.","button1Text":"Submit Abstract","button1Link":"/submit-abstract","button2Text":"Register Now","button2Link":"/register","status":"ACTIVE"}'

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $heroResp = Invoke-RestMethod -Method POST -Uri "http://localhost:8081/api/admin/hero" `
        -Headers $headers -Body $heroBody -ErrorAction Stop
    $heroId = $heroResp.id
    Write-Host "HERO CREATED - ID: $heroId"
} catch {
    Write-Host "HERO CREATE FAILED: $_"
    exit 1
}

# Step 3: Upload conference image using multipart
$imagePath = "d:\one\one\conference_hero.png"
Write-Host "Uploading image from: $imagePath"

$fileContent = [System.IO.File]::ReadAllBytes($imagePath)
$boundary = [System.Guid]::NewGuid().ToString("N")

# Build multipart body
$CRLF = "`r`n"
$header = "--$boundary${CRLF}Content-Disposition: form-data; name=`"file`"; filename=`"conference_hero.png`"${CRLF}Content-Type: image/png${CRLF}${CRLF}"
$footer = "${CRLF}--$boundary--${CRLF}"

$headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
$footerBytes = [System.Text.Encoding]::UTF8.GetBytes($footer)

$bodyStream = New-Object System.IO.MemoryStream
$bodyStream.Write($headerBytes, 0, $headerBytes.Length)
$bodyStream.Write($fileContent, 0, $fileContent.Length)
$bodyStream.Write($footerBytes, 0, $footerBytes.Length)
$multipartBytes = $bodyStream.ToArray()

$uploadHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

try {
    $uploadResp = Invoke-RestMethod -Method POST -Uri "http://localhost:8081/api/admin/hero/$heroId/hero-image" `
        -Headers $uploadHeaders -Body $multipartBytes -ErrorAction Stop
    Write-Host "IMAGE UPLOADED SUCCESSFULLY!"
    Write-Host "Hero Image: $($uploadResp.heroImage)"
} catch {
    Write-Host "IMAGE UPLOAD FAILED: $_"
}

Write-Host ""
Write-Host "=== COMPLETE ==="
Write-Host "Hero ID: $heroId is now ACTIVE on homepage"
Write-Host "Check the homepage at: http://localhost:5175/"
