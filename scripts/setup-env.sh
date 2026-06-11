#!/usr/bin/env sh
# Копирует .env.example → .env (если .env ещё не существует).
# Запуск:  sh scripts/setup-env.sh

set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXAMPLE="$ROOT/.env.example"
TARGET="$ROOT/.env"

if [ ! -f "$EXAMPLE" ]; then
  echo "Ошибка: .env.example не найден" >&2
  exit 1
fi

if [ -f "$TARGET" ]; then
  echo "Пропущено: .env уже существует"
else
  cp "$EXAMPLE" "$TARGET"
  echo "Создан: .env"
fi

echo ""
echo "Готово. При необходимости отредактируйте .env (URL API, WebSocket, social links)."
