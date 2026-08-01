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
3. Стили на токенах `var(--color-*)` / `var(--radius-*)` / `var(--ease-out)`.
4. Добавить экспорт в `src/shared/ui/index.ts` и при необходимости `src/shared/index.ts`.

## Иконки действий

Общие SVG: `src/shared/ui/icons/` (`UploadIcon`, `SearchIcon`, `LoadingIcon`, `CloseIcon`, `TrashIcon`, `EmailIcon`, `LockIcon`, `UserFaceIcon`, …). Импорт: `@/shared/ui` или `@/shared/ui/icons`.

Auth-поля используют `leftIcon` у `Input` (`EmailIcon`, `LockIcon`, `UserFaceIcon`). Fill основных path — `currentColor` (цвет от состояния поля); у `UserFaceIcon` глаза/рот остаются `#121212`.

Доменные иконки (лайк/коммент/nav) могут оставаться локальными, но action UI (upload, search, loading, auth) — из shared.

## Layouts

| Компонент | Использование |
|-----------|---------------|
| `PageLayout` | Обёртка: AsidePageNav, main, footer; loading/error через Spinner |
| `Footerlayouts` | Social links из env |
| `AsidePageNav` | Основная навигация (fixed) |

**Нет Headerlayouts** — шапка удалена; поиск/уведомления живут в feature-компонентах на страницах.

**Выравнивание aside + content:** `--layout-inset-top` / `--layout-main-padding-*` на `:root`. `AsidePageNav` — `position: fixed; top: var(--layout-inset-top)`.

## Rate limit UI

1. API возвращает 429 с `Retry-After`.
2. `parseRateLimitError` / `handleRateLimitError` обогащают error data.
3. `useRateLimitCountdown` — обратный отсчёт для кнопок/форм.
4. `ToastProvider` — глобальные уведомления (подключён в `App.tsx`).

## Тесты

Vitest + Testing Library. Shared UI без выделенных тестов; доменные тесты — в page/feature/entities (см. `npm test`).

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| `[env] Missing required` | Скопировать `.env.example` → `.env`, заполнить все ключи |
| `[env] must be a finite number` | Проверить числовые значения в `.env` |
| Toast не показывается | Убедиться, что компонент внутри `ToastProvider` |
| Шрифт не Inter | Проверить Google Fonts link в `index.html` и `--font-sans` |
