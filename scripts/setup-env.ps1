# Copies .env.example -> .env (if .env does not exist yet).
# Run:  .\scripts\setup-env.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

$examplePath = Join-Path $root ".env.example"
$targetPath = Join-Path $root ".env"

if (-not (Test-Path $examplePath)) {
    Write-Error ".env.example not found"
}

if (Test-Path $targetPath) {
    Write-Host "Skipped: .env already exists"
} else {
    Copy-Item $examplePath $targetPath
    Write-Host "Created: .env"
}

Write-Host ""
Write-Host "Done. Edit .env if needed (API URL, WebSocket, social links)."
