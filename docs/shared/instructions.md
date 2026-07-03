# shared — Instructions

## Критичные env (config/env.ts)

Все переменные обязательны — при отсутствии приложение падает с `[env] Missing required environment variable`.

| Группа | Ключи | Назначение |
|--------|-------|------------|
| API | `VITE_API_URL` | Base URL RTK Query |
| WebSocket | `VITE_WS_URL` | Socket.IO hub |
| Socket.IO | `VITE_SOCKET_*` | Transports, reconnection |
| Сообщения | `VITE_MESSAGES_*`, `VITE_MESSAGE_*` | Пагинация чатов |
| Посты | `VITE_POST_*` | Лимиты ленты |
| Поиск | `VITE_SEARCH_*` | Debounce, min length |
| UI | `VITE_*_DELAY_MS`, `VITE_*_TIMEOUT_MS` | Таймауты редиректов |
| Social | `VITE_SOCIAL_*_URL` | Ссылки в футере |

Полный список — [`.env.example`](../../.env.example).

## Как добавить shared-компонент

1. Создать `src/shared/ui/<Name>/`:
   ```
   <Name>/
   ├── ui/
   │   ├── <Name>.tsx
   │   └── <Name>.module.css
   └── index.ts
   ```

2. Компонент не должен импортировать из `entities`, `feature`, `widget`, `page`.
3. Добавить экспорт в `src/shared/ui/index.ts` и `src/shared/index.ts`.

## Layouts

| Компонент | Использование |
|-----------|---------------|
| `PageLayout` | Обёртка страниц: header, aside nav, footer, outlet |
| `Headerlayouts` | Поиск, уведомления, logout |
| `Footerlayouts` | Social links из env |

## Rate limit UI

1. API возвращает 429 с `Retry-After`.
2. `parseRateLimitError` / `handleRateLimitError` обогащают error data.
3. `useRateLimitCountdown` — обратный отсчёт для кнопок/форм.
4. `ToastProvider` — глобальные уведомления (подключён в `App.tsx`).

## SocketStatus

Подписывается на `subscribeSocketStatus` из `app/lib/socket.ts`. Показывает connected / disconnected / reconnecting.

## Тесты

Тесты для shared отсутствуют.

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| `[env] Missing required` | Скопировать `.env.example` → `.env`, заполнить все ключи |
| `[env] must be a finite number` | Проверить числовые значения в `.env` |
| Toast не показывается | Убедиться, что компонент внутри `ToastProvider` |
