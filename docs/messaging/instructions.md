# messaging — Instructions

## Локальный запуск

1. Backend с message-service и notifications-service запущен (`docker compose` в backend-репо).
2. `CORS_ORIGINS` / `SOCKET_CORS_ORIGIN` включают Vite origin (`http://localhost:5173`).
3. `VITE_API_URL=http://localhost:8080`, `VITE_WS_URL=http://localhost:3005`.
4. Авторизоваться и перейти на `/messages`.

## Основные сценарии

### Открыть мессенджер

1. `/messages` — `MessagesView` в idle: заголовок «Сообщения», CTA «Новый чат», `ChatList`.
2. `useGetChatsQuery` загружает чаты.
3. `MessagePage` только оркестрирует данные и передаёт слоты в `MessagesView`.

### Выбрать чат

1. Клик по `ChatCard` → `handleChatSelect` → `navigate(/messages/:chatId)`.
2. `MessagesView` переходит в active (три колонки; на mobile — тред + back).
3. `joinChatRoom` + `useGetMessagesQuery`.
4. Правая панель: `ChatDetailsPanel` (профиль; Фото — mint grid placeholder; Файлы — empty).

### URL sync

- `useParams().chatId` → `activeChatId`.
- Закрытие / back → `/messages`.
- Переход «Написать сообщение» с Friend/Follower открывает чат по URL.

### Отправить сообщение

1. `MessageSend` → `handleSendMessage`.
2. Пузыри: входящие слева, исходящие справа; read ticks при `isRead`.

### Создать чат

1. `CreateChatButton` с `variant="labeled"` → CreateChatModal.
2. Выбор друга → `useCreateChatMutation` → navigate на новый чат.
3. Компактный `variant="icon"` (дефолт) доступен для других мест.

## MessagesView

Shell в `src/page/shared/MessagesView/`:

| Prop | Назначение |
|------|------------|
| `hasActiveChat` | idle vs active grid |
| `isMobileSidebarOpen` / `onCloseMobileSidebar` | overlay на mobile |
| `sidebarHeader` / `sidebarList` | заголовок + список |
| `thread` / `details` | тред и правая панель (только active) |

## useMessagePage

- RTK Query + socket listeners
- Sync `activeChatId` с URL
- `handleCloseChat` для mobile back

## Бизнес-правила

- Protected route.
- Активный чат = `/messages/:chatId`.
- Вложений в message API нет — секции медиа только UI placeholder.

## Тесты

```bash
npm test
```

Покрывают `MessagesView` (layout) и `useMessagePage` (URL/navigate). Моки: RTK Query, router, socket.

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| Чат не открывается с FriendPage | Проверить URL sync в `useMessagePage` |
| Нет realtime | Socket, `chat:join`, `VITE_WS_URL`, `SOCKET_CORS_ORIGIN` |
| Нет email в шапке | Public profile API / privacy email |
| Overlay не закрывается | `onCloseMobileSidebar` в `MessagesView` |
