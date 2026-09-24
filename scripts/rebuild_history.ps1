# Rebuild clean Git history with exact timestamps for each version
$ErrorActionPreference = "Stop"

$root = $PSScriptRoot | Split-Path -Parent
Set-Location $root

Write-Host "Creating history on branch main-history..." -ForegroundColor Cyan

# Start from f8dc075
git checkout -B main-history f8dc075

$versions = @(
    @{
        Ver = "3.0.0"
        Zip = "himoya-extension-v3.0.0.zip"
        Date = "2026-09-24T20:41:13+05:00"
        Msg = "feat: release v3.0.0 with multi-layer detection engine, heuristics, and trilingual support"
    },
    @{
        Ver = "3.5.0"
        Zip = "himoya-extension-v3.5.0.zip"
        Date = "2026-09-25T20:19:11+05:00"
        Msg = "feat: release v3.5.0 with requestIdleCallback DOM chunking and performance optimizations"
    },
    @{
        Ver = "4.0.0"
        Zip = "himoya-extension-v4.0.0.zip"
        Date = "2026-09-25T20:19:30+05:00"
        Msg = "feat: release v4.0.0 with Chrome Built-in AI (Gemini Nano Prompt API) provider"
    },
    @{
        Ver = "4.5.0"
        Zip = "himoya-extension-v4.5.0.zip"
        Date = "2026-09-27T21:18:33+05:00"
        Msg = "feat: release v4.5.0 with Naive Bayes probabilistic NLP classifier and cyber shield branding"
    },
    @{
        Ver = "5.0.0"
        Zip = "himoya-extension-v5.0.0.zip"
        Date = "2026-10-01T11:42:13+05:00"
        Msg = "feat: release v5.0.0 with SPA-safe non-destructive DOM injection and badge sync"
    }
)

$tempExtract = Join-Path $root "temp_extract"

foreach ($v in $versions) {
    Write-Host "Processing $($v.Ver)..." -ForegroundColor Yellow
    if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force }
    New-Item -ItemType Directory -Path $tempExtract | Out-Null
    
    Expand-Archive -Path (Join-Path $root $v.Zip) -DestinationPath $tempExtract -Force
    
    # Copy files over
    Copy-Item -Path "$tempExtract\*" -Destination $root -Recurse -Force
    
    # Stage changes
    git add -A
    
    $env:GIT_AUTHOR_DATE = $v.Date
    $env:GIT_COMMITTER_DATE = $v.Date
    git commit -m $v.Msg
    git tag -a "v$($v.Ver)" -m "Release v$($v.Ver) ($($v.Date))" -f
}

# Finally apply v5.1.0 changes
Write-Host "Processing 5.1.0..." -ForegroundColor Yellow
Expand-Archive -Path (Join-Path $root "himoya-extension-v5.1.0.zip") -DestinationPath $tempExtract -Force
Copy-Item -Path "$tempExtract\*" -Destination $root -Recurse -Force
if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force }

# Restore root gitignore, scripts, store, test, CHANGELOG
git checkout 34cb1c0 -- .gitignore scripts/ store/ test/ package.ps1 README.md CHANGELOG.md manifest.json popup/

git add -A
$env:GIT_AUTHOR_DATE = "2026-10-01T15:36:19+05:00"
$env:GIT_COMMITTER_DATE = "2026-10-01T15:36:19+05:00"
git commit -m "feat: release v5.1.0 with Raycast cyber dark UI, radar scanner, and activeTab URL sync"
git tag -a "v5.1.0" -m "Release v5.1.0 (2026-10-01T15:36:19+05:00)" -f

# Also tag initial release v2.7.3
git tag -a "v2.7.3" 3162b9e -m "Release v2.7.3: Initial regex prototype (2025-10-13)" -f

Write-Host "Done rebuilding history!" -ForegroundColor Green
