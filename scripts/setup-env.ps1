# Копирует .env.example → .env (если .env ещё не существует).
# Запуск:  .\scripts\setup-env.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

$examplePath = Join-Path $root ".env.example"
$targetPath = Join-Path $root ".env"

if (-not (Test-Path $examplePath)) {
    Write-Error ".env.example не найден"
}

if (Test-Path $targetPath) {
    Write-Host "Пропущено: .env уже существует"
} else {
    Copy-Item $examplePath $targetPath
    Write-Host "Создан: .env"
}

Write-Host ""
Write-Host "Готово. При необходимости отредактируйте .env (URL API, WebSocket, social links)."
