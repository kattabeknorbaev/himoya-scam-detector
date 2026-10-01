# Himoya Extension Packaging & Validation Script v5.4.0
# Generates an enterprise-grade .zip package ready for Chrome Web Store Developer Console upload.

Write-Host "`n=== Himoya Extension Build & Packaging Pipeline (v5.4.0) ===`n" -ForegroundColor Cyan

$root = $PSScriptRoot
$tempDist = Join-Path $root "dist_tmp"

# 1. Validate manifest.json
$manifestPath = Join-Path $root "manifest.json"
if (-not (Test-Path $manifestPath)) {
    Write-Error "manifest.json not found!"
    exit 1
}

try {
    $manifestContent = Get-Content $manifestPath -Raw | ConvertFrom-Json
    $version = $manifestContent.version
    $zipName = "himoya-extension-v$version.zip"
    $zipPath = Join-Path $root $zipName
    Write-Host "[OK] manifest.json is valid JSON (version: $version)" -ForegroundColor Green
} catch {
    Write-Error "manifest.json has syntax errors: $_"
    exit 1
}

# 2. Run Engine unit tests via Node.js
Write-Host "Running detection engine unit tests..." -ForegroundColor Yellow
$test1 = & node (Join-Path $root "tests\ahoCorasick.test.js")
if ($LASTEXITCODE -ne 0) {
    Write-Error "Aho-Corasick unit tests failed! Aborting packaging."
    exit 1
}
Write-Host $test1 -ForegroundColor Green

$test2 = & node (Join-Path $root "tests\normalizer.test.js")
if ($LASTEXITCODE -ne 0) {
    Write-Error "Normalizer unit tests failed! Aborting packaging."
    exit 1
}
Write-Host $test2 -ForegroundColor Green

# 3. Clean previous builds
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}
if (Test-Path $tempDist) {
    Remove-Item $tempDist -Recurse -Force
}

New-Item -ItemType Directory -Path $tempDist | Out-Null

# 4. Copy required extension files into dist_tmp
$rootFiles = @(
    "manifest.json",
    "icon16.png",
    "icon48.png",
    "icon128.png",
    "LICENSE"
)

foreach ($f in $rootFiles) {
    $src = Join-Path $root $f
    if (Test-Path $src) {
        Copy-Item $src -Destination $tempDist
    } else {
        Write-Warning "File missing: $f"
    }
}

# Copy src directory recursively
$srcDir = Join-Path $root "src"
if (Test-Path $srcDir) {
    Copy-Item -Path $srcDir -Destination $tempDist -Recurse
    Write-Host "[OK] Copied src/ directory tree" -ForegroundColor Green
} else {
    Write-Error "src/ directory not found! Aborting packaging."
    exit 1
}

# 5. Compress to ZIP
Write-Host "Creating package: $zipName..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDist\*" -DestinationPath $zipPath -Force

# Clean temp directory
Remove-Item $tempDist -Recurse -Force

$zipFileInfo = Get-Item $zipPath
$sizeKb = [math]::Round($zipFileInfo.Length / 1KB, 2)

Write-Host "`n[SUCCESS] $zipName created successfully ($sizeKb KB)!" -ForegroundColor Green
Write-Host "Location: $zipPath" -ForegroundColor Cyan
Write-Host "You can now upload this .zip directly to the Chrome Web Store Developer Console!`n" -ForegroundColor Yellow
