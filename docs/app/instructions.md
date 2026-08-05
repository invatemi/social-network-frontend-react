# app — Instructions

## Локальный запуск

### Через npm (рекомендуется)

```bash
# Инициализация .env
cp .env.example .env   # или scripts/setup-env.ps1 / setup-env.sh

npm install
npm run dev
```

Приложение: http://localhost:5173

Backend должен быть запущен (`docker compose up` в social-backend-service). В backend `.env`: `CORS_ORIGINS=http://localhost:5173`.

### Сборка

```bash
npm run build
npm run preview
```

## Критичные переменные окружения

| Переменная | По умолчанию | Назначение |
|------------|--------------|------------|
| `VITE_API_URL` | `http://localhost:8088` | KrakenD API Gateway (host-порт backend) |
| `VITE_WS_URL` | `http://localhost:3005` | Socket.IO notifications-service |

Полный список — в [`.env.example`](../../.env.example).

## Основные сценарии

### Bootstrap сессии при старте

1. `AuthBootstrap` вызывает `POST /api/auth/refresh` (cookie).
2. При успехе — `setAccessToken`, затем `getUserProfile`, затем `getAccounts`.
3. `setAuthInitialized(true)` — рендер роутера.
4. `App.tsx` при наличии token вызывает `initSocket(token, dispatch)`.

### Защищённые маршруты

`ProtectedRoute` проверяет `isAuthInitialized` и `isAuthenticated`. При отсутствии auth — редирект на `/autorization` с `state.from`.

### Switch / add account

`applyAccountSession` (`app/store/lib`) обновляет auth + accounts и вызывает `baseApi.util.resetApiState()`. Socket переподключается по новому `accessToken` в `App.tsx`.

### Logout

`authSlice.logout()` очищает state (включая accounts) и вызывает `disconnectSocket()`. При vault с оставшимися аккаунтами logout API может вернуть `switched: true` — тогда сессию применяют без полного logout.

## Как добавить RTK endpoint в app/store/api

1. Создать или расширить файл в `src/app/store/api/` (например `newApi.ts`).
2. Использовать `baseApi.injectEndpoints({ endpoints: (builder) => ({ ... }) })`.
3. Экспортировать хуки из файла.
4. Добавить экспорт в `src/app/store/api/index.ts` при необходимости.
5. Указать `providesTags` / `invalidatesTags`.

Используйте `app/store/api` для cross-cutting API (auth, notifications, password codes). Доменные endpoints — в `entities/*/api`.

## Socket-события (кратко)

| Событие | Действие |
|---------|----------|
| `post:created` | invalidate `Feed`, `Posts` |
| `post:updated`, `post:liked` | patch cache + invalidate |
| `post:deleted` | remove from cache |
| `comment:created`, `comment:deleted` | patch/invalidate Comments |
| `notification:friend_*` | invalidate Friends, User |
| `message:new` | `updateQueryData` messages + chats (без refetch storm) |
| `message:updated` / `message:deleted` / `chat:read` | cache patch |
| `chat:created` / `chat:deleted` | invalidate Chats |
| `user:online`, `user:offline` | только `presenceSlice` (без invalidate User) |

Полный список — `src/app/lib/socket.ts`.

## Тесты

Тесты для слоя `app` отсутствуют.

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| CORS errors | Проверить `CORS_ORIGINS` в backend, `VITE_API_URL` |
| 401 loop | Проверить refresh cookie, SameSite, `credentials: "include"` |
| Socket не подключается | Проверить `VITE_WS_URL`, notifications-service :3005, access token |
| Бесконечный Spinner при старте | Проверить доступность `/api/auth/refresh`, сеть |
| Env error при старте | Все `VITE_*` из `.env.example` должны быть заданы |
