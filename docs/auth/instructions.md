# auth — Instructions

## Локальный запуск (auth flow)

1. Запустить backend: `docker compose up` в social-backend-service.
2. Убедиться в `CORS_ORIGINS=http://localhost:5173` в backend `.env`.
3. Запустить frontend: `npm run dev`.
4. Открыть http://localhost:5173/autorization.

## Основные сценарии

### Регистрация

1. Пользователь на `/registration`.
2. Widget `Registration` валидирует форму (Zod).
3. Live-индикатор паролей: оба поля непустые → совпадают — оба `success` (зелёный); не совпадают — password `success`, confirmPassword danger.
4. `POST /api/auth/register` с `credentials: "include"`.
5. Ответ: `{ accessToken, user }` + Set-Cookie refresh.
6. `dispatch(setAuth({ accessToken, user }))`.
7. Navigate на защищённую страницу (обычно `/`).

### Вход

1. Пользователь на `/autorization`.
2. Widget `Autorization` → `useLoginMutation`.
3. При неверных credentials (без field `errors`) поля email и password только краснеют (без текста ошибки).
4. При успехе: `setAuth` → navigate (из `location.state.from` или `/`).
5. `App.tsx` вызывает `initSocket(accessToken)`.

### Bootstrap при старте

1. `AuthBootstrap` показывает `Spinner` до завершения.
2. `refreshTokens()` — если cookie валиден, получаем accessToken.
3. `fetchUserProfile()` — опционально, ошибка не блокирует auth.
4. `setAuthInitialized(true)` — рендер роутера.

### Auto-refresh (401)

1. Любой API-запрос получает 401.
2. `customBaseQuery` вызывает `refreshAccessToken` (mutex).
3. Успех → повтор запроса с новым token.
4. Неудача → `logout()`, редирект на `/autorization`.

### Logout

1. Header → `useLogoutMutation` + `dispatch(logout())`.
2. `logout` очищает state и `disconnectSocket()`.
3. Navigate на `/autorization`.

## Rate limiting

При 429 на login/register:
- Toast с сообщением
- `useRateLimitCountdown` блокирует кнопку submit
- `Retry-After` из заголовка ответа

## Бизнес-правила

- Access token **не** сохраняется в localStorage/sessionStorage.
- Refresh только через HttpOnly cookie.
- `ProtectedRoute` возвращает `null` до auth — без flash контента.
- Endpoint `searchUsers` не отправляет Bearer (публичный поиск).

## QA чеклист

- [ ] Регистрация → редирект на ленту, профиль доступен
- [ ] Login → cookie установлен, socket connected
- [ ] Reload страницы → сессия восстанавливается без re-login
- [ ] Logout → cookie инвалидирован, protected routes недоступны
- [ ] Истёкший access + валидный refresh → запросы проходят без logout
- [ ] Истёкший refresh → logout, редирект на `/autorization`
- [ ] Rate limit → Toast + countdown на форме
- [ ] Неверный логин → красные border/иконки/текст у email и password (без AUTH_ERROR)
- [ ] Регистрация: несовпадение паролей → confirm красный, password зелёный; совпадение → оба зелёные
- [ ] Auth-поля показывают leftIcon (email / lock / user face)

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| 401 loop | Проверить SameSite cookie, CORS, `credentials: "include"` |
| Cookie не ставится | Backend `Secure` flag в dev, домен, CORS credentials |
| Spinner бесконечно | Backend `/api/auth/refresh` недоступен |
| Socket не подключается после login | Проверить `accessToken` в Redux, `VITE_WS_URL` |
| CORS error | `CORS_ORIGINS` в backend должен включать `http://localhost:5173` |

## Связанная документация

- [docs/app/](../app/overview.md) — store, bootstrap, socket lifecycle
- [docs/rules/api-conventions.md](../rules/api-conventions.md) — контракт API
- Backend: [auth-service instructions](https://github.com/invatemi/social-backend-service/blob/main/docs/auth-service/instructions.md)
