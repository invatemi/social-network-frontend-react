# messaging — Overview

## Назначение

Доменный модуль **messaging** — личные сообщения: список чатов, переписка, создание чата, вложения (фото/файлы), realtime через Socket.IO.

## Зона ответственности

- UI мессенджера в единой тёмной теме
- Idle: список чатов + labeled CTA «Новый чат»
- Active (`/messages/:chatId`): три колонки — чаты / тред / детали (профиль, фото, файлы)
- CRUD через REST + Socket.IO; **read-state** обновляется на бэкенде при `GET` сообщений, фронт инвалидирует список чатов
- Вложения: paperclip в `MessageSend` → MinIO presign → `POST /send`; панель деталей и пузыри показывают реальные фото/файлы

**Не входит:** forward/reply, серверный поиск чатов (клиентский filter).

## Участвующие модули

| Слой | Модуль | Роль |
|------|--------|------|
| page | `MessagePage`, `ChatDetailsPanel`, `useMessagePage` | Данные, URL sync, upload+send |
| page/shared | `MessagesView` | Layout idle ↔ 3 колонки |
| widget | `ChatList`, `MessageList` | Список и тред |
| feature | `chat`, `message` | Создание / отправка + upload helper |
| entities | `chat` (ChatCard), `message` (MessageCard, messagesApi) | UI + API |

## UI-детали

- ChatCard: unread badge с числом, online-dot сверху-справа, active + зелёная полоска слева
- MessageCard: входящие `rgba(32,32,32,1)`, исходящие `rgba(53,53,53,1)`; вложения (image preview / file link); ticks ✓/✓✓
- Поиск — клиентский filter в `useChatList`
- Клик по аватару/имени/email в шапке треда и в ChatDetailsPanel → `/user/:userId`
- MessageSend: круглая кнопка-скрепка слева от textarea; превью выбранных файлов; textarea авто-растёт вверх
- ChatDetailsPanel: сетка фото и список файлов из `GET .../attachments`

## API (backend)

Префикс `/api/messages` — message-service через KrakenD.

| Операция | Hook | Метод |
|----------|------|-------|
| Список чатов | `useGetChatsQuery` | GET `/chats` |
| Сообщения | `useGetMessagesQuery` | GET `/:chatId` (mark read) |
| Upload URL | `useLazyGetMessageUploadUrlQuery` | GET `/chats/:id/upload-url` |
| Вложения чата | `useGetChatAttachmentsQuery` | GET `/chats/:id/attachments` |
| Отправка | `useSendMessageMutation` | POST `/send` (flat, + attachments) |
| Создание | `useCreateChatMutation` | POST `/chats` (flat) |
| Удаление | `useDeleteChatMutation` | DELETE `/chats/:id` |

## Тесты

- `MessagesView.test.tsx`, `useMessagePage.test.ts`
- `npm test`
