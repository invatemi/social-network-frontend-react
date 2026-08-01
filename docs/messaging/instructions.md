# messaging — Instructions

## Локальный запуск

1. Backend: message-service + notifications-service + MinIO (`docker compose` в backend-репо).
2. `CORS_ORIGINS` / `SOCKET_CORS_ORIGIN` включают Vite origin; MinIO CORS для PUT с Vite.
3. `VITE_API_URL` (KrakenD), `VITE_WS_URL` (notifications, обычно `:3005`).
4. Авторизоваться → `/messages`.

## Сценарии

### Inbox

`/messages` — idle: «Сообщения», «Новый чат», `ChatList` + поиск.

### Открыть чат

Клик → `/messages/:chatId` → `getMessages` (бэкенд ставит `lastReadAt`) → invalidate `Chats` → unread сбрасывается.
Правая панель загружает `GET /chats/:id/attachments?kind=image|file`.

### Отправить текст

`MessageSend` → `POST /send` → socket `message:new` → refetch.
Поле ввода авто-растёт вверх без scrollbar (весь черновик виден), высота анимируется.

### Отправить вложение

1. Кнопка-скрепка слева от textarea → выбор файлов/фото (до 5, ≤20 MB).
2. Превью над формой; можно убрать файл.
3. Send → `GET .../upload-url` → PUT в MinIO → `POST /send` с `attachments`.
4. В треде: preview фото / ссылка на файл; в панели «Фото»/«Файлы» — агрегаты чата.

### Открыть профиль собеседника

Клик по аватару / имени / email в шапке треда или в правой панели → `/user/:userId`.

### Создать

`CreateChatModal` (друзья) или Friend/Follower page → `POST /chats` (flat `ChatData`) → navigate.

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| Нет realtime | `VITE_WS_URL`, `SOCKET_CORS_ORIGIN`, `chat:join` |
| Unread не сбрасывается | GET messages должен пройти; смотреть network |
| Пустой create | ответ create должен быть flat с `chatId` |
| Upload падает | MinIO CORS/`S3_UPLOAD_ENDPOINT`, JWT на upload-url, размер ≤20 MB |
| Панель пустая после send | invalidate `ChatAttachments`; проверить `kind` image vs file |
