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
**Enter** — отправить сообщение; **Shift+Enter** — перенос строки.

### Отправить вложение

1. Кнопка-скрепка слева от textarea → выбор файлов/фото (до 5, ≤20 MB).
2. Превью над формой; можно убрать файл.
3. Send → `GET .../upload-url` → PUT в MinIO → `POST /send` с `attachments`.
4. В треде: preview фото / ссылка на файл; в панели «Фото»/«Файлы» — агрегаты чата.

### Открыть профиль собеседника

Клик по аватару / имени / email в шапке треда или в правой панели → `/user/:userId`.

### Создать

`CreateChatModal` (друзья) или Friend/Follower page → `POST /chats` (flat `ChatData`) → navigate.

### Контекстное меню / действия

1. Double-click или right-click по строке сообщения → blur overlay + меню.
2. Ответить / Скопировать / Редактировать (свои) / Переслать / Пожаловаться / Удалить.
3. Ответить → баннер в `MessageSend` → `POST /send` с `replyToId`; в пузыре сверху цитата исходного; клик по цитате → скролл к исходному (если оно в загруженной истории).
4. Forward → модалка выбора чатов → `POST /forward`.
5. Edit → режим в `MessageSend` (текст + add/remove вложений) → `PATCH /:messageId`.
6. **Enter** в поле ввода → отправить (или сохранить правку); **Shift+Enter** → новая строка.
7. ArrowUp (на странице чата, черновик пустой) → редактировать последнее своё сообщение — работает и без фокуса в поле ввода.
8. Escape (приоритет): отмена edit/reply → закрытие focus/меню/модалок → иначе закрыть чат (idle `/messages`).
9. Realtime: `message:updated` / `message:deleted` обновляют кэш (в т.ч. `attachments`, `editedAt` → «изм.»).

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| Нет realtime | `VITE_WS_URL`, `SOCKET_CORS_ORIGIN`, `chat:join` |
| Unread не сбрасывается | GET messages должен пройти; смотреть network |
| Пустой create | ответ create должен быть flat с `chatId` |
| Upload падает | MinIO CORS/`S3_UPLOAD_ENDPOINT`, JWT на upload-url, размер ≤20 MB |
| Панель пустая после send | invalidate `ChatAttachments`; проверить `kind` image vs file |
