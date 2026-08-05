# messaging — Overview

## Назначение

Доменный модуль **messaging** — личные сообщения: список чатов, переписка, создание чата, вложения (фото/файлы), realtime через Socket.IO.

## Зона ответственности

- UI мессенджера в единой тёмной теме
- Idle: список чатов + labeled CTA «Новый чат»
- Active (`/messages/:chatId`): три колонки — чаты / тред / детали (профиль, фото, файлы)
- CRUD через REST + Socket.IO; **read-state** обновляется на бэкенде при `GET` сообщений; realtime `message:new` патчит RTK cache (без double refetch)
- Единый transform: `formatMessageForUI` (`widget/MessageList/lib`) — MessagePage и `useMessageList`
- MessageList: без windowing/`content-visibility` (ломали scroll); stick-to-bottom только у низа; prepend истории с якорем; PostList — `useWindowedRange`; leaf cards memoized
- Вложения: paperclip в `MessageSend` → MinIO presign → `POST /send`; панель деталей и пузыри показывают реальные фото/файлы

**Не входит:** threaded conversations (ветки как продукт), серверный поиск чатов (клиентский filter).

**Контекстное меню сообщения:** double-click / right-click → blur focus, меню Ответить / Скопировать / Редактировать (свои) / Переслать / Пожаловаться / Удалить; ответ с цитатой исходного сообщения в пузыре; пересылка в другие чаты; ArrowUp на странице чата (пустой черновик) → edit последнего своего; Escape → отмена edit/reply / overlays, иначе закрытие чата в idle.

## Участвующие модули

| Слой | Модуль | Роль |
|------|--------|------|
| page | `MessagePage`, `ChatDetailsPanel`, `useMessagePage` | Данные, URL sync, upload+send |
| page/shared | `MessagesView` | Layout idle ↔ 3 колонки |
| widget | `ChatList`, `MessageList` | Список и тред |
| feature | `chat`, `message` | Создание / отправка / focus-меню / forward + upload helper |
| entities | `chat` (ChatCard), `message` (MessageCard, messagesApi) | UI + API |

## UI-детали

- ChatCard: unread badge с числом, online-dot сверху-справа, active + зелёная полоска слева
- MessageCard: входящие `rgba(32,32,32,1)`, исходящие `rgba(53,53,53,1)`; цитата `replyTo` (автор + сниппет + время) сверху текста ответа — клик скроллит к исходному; вложения (image preview / file link); ticks ✓/✓✓; метка «изм.» при `editedAt`
- Focus overlay: лёгкий scrim; blur только без `prefers-reduced-motion` (`usePrefersReducedMotion`)
- Поиск — клиентский filter в `useChatList`
- Клик по аватару/имени/email в шапке треда и в ChatDetailsPanel → `/user/:userId`
- MessageSend: круглая кнопка-скрепка слева от textarea; превью выбранных файлов; textarea авто-растёт вверх; режим ответа (баннер с автором/сниппетом → `replyToId` в send) и редактирования (текст + add/remove вложений); **Enter** — отправка / сохранение правки, **Shift+Enter** — новая строка
- ChatDetailsPanel: сетка фото и список файлов из `GET .../attachments`

## API (backend)

Префикс `/api/messages` — message-service через KrakenD.

| Операция | Hook | Метод |
|----------|------|-------|
| Список чатов | `useGetChatsQuery` | GET `/chats` |
| Сообщения | `useGetMessagesQuery` | GET `/:chatId` (mark read) |
| Upload URL | `useLazyGetMessageUploadUrlQuery` | GET `/chats/:id/upload-url` |
| Вложения чата | `useGetChatAttachmentsQuery` | GET `/chats/:id/attachments` |
| Отправка | `useSendMessageMutation` | POST `/send` (flat, + attachments, optional `replyToId`) |
| Пересылка | `useForwardMessagesMutation` | POST `/forward` (`messageIds`, `targetChatIds`) |
| Редактирование | `useEditMessageMutation` | PATCH `/:messageId` |
| Удаление сообщения | `useDeleteMessageMutation` | DELETE `/:messageId` |
| Bulk delete | `useDeleteMessagesBulkMutation` | DELETE `/bulk` |
| Создание | `useCreateChatMutation` | POST `/chats` (flat) |
| Удаление чата | `useDeleteChatMutation` | DELETE `/chats/:id` |

## Тесты

- `MessagesView.test.tsx`, `useMessagePage.test.ts`
- `npm test`
