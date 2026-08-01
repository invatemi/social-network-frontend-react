# API-конвенции (клиент)

Правила взаимодействия SPA с backend через KrakenD и notifications-service. Согласованы с [backend api-conventions](https://github.com/invatemi/social-backend-service/blob/main/docs/rules/api-conventions.md).

## Базовый URL

| Переменная | По умолчанию | Использование |
|------------|--------------|---------------|
| `VITE_API_URL` | `http://localhost:8080` | Base URL для RTK Query (`env.apiUrl`) |
| `VITE_WS_URL` | `http://localhost:3005` | Socket.IO hub (не через KrakenD) |

Загрузка: `src/shared/config/env.ts`.

## Аутентификация

### Модель токенов

| Токен | Хранение | Передача |
|-------|----------|----------|
| Access (JWT) | Redux `auth.accessToken` (память) | Header `Authorization: Bearer <token>` |
| Refresh | HttpOnly cookie | `credentials: "include"` на auth-запросах |

### customBaseQuery

Файл: `src/app/store/lib/updateToken.ts`.

1. Все запросы идут с `credentials: "include"`.
2. `prepareHeaders` добавляет Bearer token из Redux (кроме endpoint `searchUsers`).
3. При **401** (кроме auth-путей) — `refreshAccessToken` через mutex (`refreshMutex.ts`).
4. При успешном refresh — повтор исходного запроса.
5. При неудачном refresh — `dispatch(logout())`.

Пути без auto-refresh:

- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/refresh`
- `/api/auth/logout`

### Auth API (`app/store/api/authApi.ts`)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/refresh` | Обновление access token |
| POST | `/api/auth/logout` | Инвалидация refresh token |

## RTK Query

### Единый baseApi

Файл: `src/app/store/api/baseApi.ts`.

- `reducerPath`: `"baseApi"`
- `baseQuery`: `customBaseQuery`
- `endpoints`: пустой объект; endpoints добавляются через `injectEndpoints`

### Tag types

| Tag | Назначение |
|-----|------------|
| `User`, `UserMe` | Профили пользователей |
| `Posts`, `Feed` | Посты и лента |
| `Comments` | Комментарии к посту |
| `Auth` | Сессия |
| `Friends`, `FriendStatus` | Друзья и статусы |
| `Chat`, `Chats`, `Messages`, `Message`, `ChatAttachments` | Мессенджер |

### Маппинг API-модулей → backend prefix

| Модуль | Путь в `src/` | Backend prefix |
|--------|---------------|----------------|
| authApi | `app/store/api/authApi.ts` | `/api/auth/*` |
| codeApi | `app/store/api/codeApi.ts` | `/api/users/me/password/*` |
| notificationsApi | `app/store/api/notificationsApi.ts` | friend requests |
| userApi | `entities/user/api/userApi.ts` | `/api/users/*` |
| postApi | `entities/post/api/postApi.ts` | `/api/posts/*` |
| commentApi | `entities/comment/api/commentApi.ts` | `/api/comments/*` |
| friendApi | `entities/friend/api/friendApi.ts` | `/api/users/*/friends`, `/follow` |
| followersApi | `entities/follower/api/followerApi.ts` | `/api/users/*/followers` |
| searchApi | `entities/search-user/api/searchApi.ts` | `/api/users/search` |
| messagesApi | `entities/message/api/messagesApi.ts` | `/api/messages/*` |

## Rate limiting (429)

При статусе **429**:

1. `parseRetryAfterSeconds` читает заголовок `Retry-After`.
2. `enrichRateLimitErrorData` добавляет `retryAfterSeconds` в `error.data`.
3. UI показывает Toast с обратным отсчётом (`useRateLimitCountdown`).

Файлы: `src/shared/lib/api/parseRateLimitError.ts`, `handleRateLimitError.ts`.

## WebSocket

- Подключение: `initSocket(token, dispatch)` в `src/app/lib/socket.ts`.
- Auth: `{ token }` в `socket.auth` + header `Authorization: Bearer <token>`.
- События: `post:*`, `comment:*`, `notification:*`, `user:*`, `message:new`, `chat:*`.
- Комнаты чата: `chat:join` / `chat:leave`.

## Формат ошибок backend

Клиент ожидает JSON с полем `error` (см. backend `api-conventions.md`). RTK Query возвращает ошибки в `result.error.data`.

## Версионирование

Версионирование API на уровне URL отсутствует. Контракт определяется KrakenD gateway и backend-сервисами.
