# messaging — Instructions

## Локальный запуск

1. Backend с message-service и notifications-service запущен.
2. `VITE_API_URL=http://localhost:8080`, `VITE_WS_URL=http://localhost:3005`.
3. Авторизоваться и перейти на `/messages`.

## Основные сценарии

### Открыть мессенджер

1. Navigate на `/messages`.
2. `useGetChatsQuery` загружает список чатов.
3. `ChatList` отображает `ChatCard` для каждого чата.

### Выбрать чат

1. Клик по чату → `handleChatSelect(chatId)`.
2. Navigate на `/messages/:chatId`.
3. `joinChatRoom(chatId)` — подписка на socket-комнату.
4. `useGetMessagesQuery` загружает сообщения.
5. При unmount / смене чата — `leaveChatRoom`.

### Отправить сообщение

1. `MessageSend` (feature/message) → `handleSendMessage(text)`.
2. `useSendMessageMutation` → `POST /api/messages/send`.
3. При успехе — refetch messages/chats.
4. Параллельно `message:new` через socket обновляет список.

### Создать чат

1. `CreateChatButton` → `CreateChatModal`.
2. Выбор пользователя, `useCreateChatMutation`.
3. Socket `chat:created` → invalidate Chats для обеих сторон.
4. Navigate на новый чат.

### Infinite scroll (старые сообщения)

1. `MessageList` вызывает `handleLoadMessages(before)`.
2. Подгрузка с cursor `before` (createdAt).
3. Prepend к текущему списку.

### Удалить чат

1. `handleDeleteChat` → `useDeleteChatMutation`.
2. Socket `chat:deleted` → invalidate tags.
3. Сброс activeChatId, navigate на `/messages`.

## useMessagePage

Центральный хук страницы (`src/page/MessagePage/lib/useMessagePage.ts`):

- Оркестрация RTK Query (chats, messages, mutations)
- Socket listeners через `useSocket`
- Mobile sidebar toggle
- Sync `activeChatId` с URL params

## Бизнес-правила

- Сообщения требуют auth (protected route).
- Активный чат синхронизирован с URL (`/messages/:chatId`).
- При `message:new` в активном чате — `refetchMessages`.
- Лимиты пагинации из `env.messages.*`.

## Тесты

Тесты для messaging отсутствуют.

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| Сообщения не приходят realtime | Проверить socket connection, `chat:join`, `VITE_WS_URL` |
| Новый чат не виден второму пользователю | Проверить `chat:created` handler, notifications-service |
| Старые сообщения не грузятся | Проверить cursor `before` в `handleLoadMessages` |
| 401 на messages API | Проверить auth flow (docs/auth/) |
| Socket disconnected | `SocketStatus` в header, env reconnection settings |

## Связанная документация

- [docs/page/](../page/overview.md) — MessagePage
- [docs/entities/](../entities/overview.md) — messagesApi
- [docs/app/](../app/overview.md) — socket.ts
- Backend: [message-service](https://github.com/invatemi/social-backend-service/blob/main/docs/message-service/overview.md), [notifications-service](https://github.com/invatemi/social-backend-service/blob/main/docs/notifications-service/overview.md)
