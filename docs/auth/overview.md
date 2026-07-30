# auth — Overview

## Назначение

Доменный модуль **auth** описывает сквозной flow аутентификации: регистрация, вход, восстановление сессии, refresh, logout и защита маршрутов.

## Зона ответственности

- Хранение access token в Redux
- Refresh token в HttpOnly cookie
- Bootstrap сессии при старте приложения
- Auto-refresh при 401
- Защищённые маршруты
- Инициализация Socket.IO после login

**Не входит:** смена пароля (codeApi + SettingsModal в feature/user-detail), профиль пользователя (entities/user).

## UI

Flat dark auth без Three.js: centered card (`--color-surface`), dark Input/Button, logo. Страницы `AutorizationPage` / `RegistrationPage` через `PageLayout` (без aside/footer по необходимости).

## Участвующие модули (сквозной flow)

| Слой | Модуль | Роль |
|------|--------|------|
| app | `authSlice` | State: user, accessToken, flags |
| app | `authApi` | login, register, refresh, logout |
| app | `updateToken.ts` | Bearer + 401 interceptor |
| app | `refreshMutex.ts` | Один refresh на N параллельных 401 |
| app | `AuthBootstrap` | Refresh cookie при старте |
| app | `ProtectedRoute` | Guard маршрутов |
| app | `App.tsx` | initSocket при наличии token |
| page | `AutorizationPage`, `RegistrationPage` | Страницы auth |
| widget | `Autorization`, `Registration` | Формы с Zod |
| feature | `ProfileMenu` | Logout из меню профиля |
| entities | `userApi` | Профиль после login/bootstrap |

## Связи

```mermaid
sequenceDiagram
  participant User
  participant Widget as widget/Autorization
  participant Store as authSlice
  participant RTK as authApi
  participant Backend as KrakenD

  User->>Widget: login form
  Widget->>RTK: POST /api/auth/login
  RTK->>Backend: credentials include
  Backend-->>RTK: accessToken + Set-Cookie refresh
  RTK->>Store: setAuth
  Note over Store: App.tsx initSocket(token)
```

```mermaid
sequenceDiagram
  participant App
  participant Bootstrap as AuthBootstrap
  participant RTK as refresh
  participant Backend

  App->>Bootstrap: mount
  Bootstrap->>RTK: POST /api/auth/refresh
  alt valid cookie
    RTK->>Backend: cookie
    Backend-->>RTK: accessToken
    Bootstrap->>Bootstrap: fetchUserProfile
  else no cookie
    Bootstrap->>Bootstrap: stay unauthenticated
  end
  Bootstrap->>App: setAuthInitialized(true)
```

## API (backend)

Префикс `/api/auth` — см. backend [auth-service](https://github.com/invatemi/social-backend-service/blob/main/docs/auth-service/overview.md).

| Метод | Путь | Клиент |
|-------|------|--------|
| POST | `/register` | `useRegisterMutation` |
| POST | `/login` | `useLoginMutation` |
| POST | `/refresh` | `useRefreshTokensMutation`, `refreshMutex` |
| POST | `/logout` | `useLogoutMutation` |
