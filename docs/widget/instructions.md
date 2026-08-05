# widget — Instructions

## Когда widget vs feature

| Критерий | widget | feature |
|----------|--------|---------|
| Размер | Список, форма, крупный блок | Одно действие (кнопка, модалка, форма) |
| Переиспользование | На нескольких страницах | Встраивается в widget/page |
| Пример | PostList, FriendList | CreatePost, CreateFriend |

## Как добавить widget

1. Создать `src/widget/<Name>/` со структурой `ui/`, `hooks/`, `lib/`, `index.ts`.
2. Использовать entities для карточек, feature для действий.
3. Экспортировать из `src/widget/index.ts`.

## Основные сценарии

### PostList

- Отображение `PostCard` для каждого поста
- Пагинация / load more
- Лайки через `postApi`
- Realtime постов — глобальные handlers в `app/lib/socket.ts` (per-post subscription не используется)

### Autorization / Registration

- Zod-валидация в `lib/`
- `useLoginMutation` / `useRegisterMutation`
- `leftIcon`: `EmailIcon`, `LockIcon`, `UserFaceIcon` (из `@/shared/ui`)
- Login fail без field errors → подсветка email + password без текста ошибки
- Registration: live match паролей (success / danger на `Input`, без текста при live-mismatch)
- При успехе: `setAuth` → navigate
- Rate limit: Toast + countdown

### MessageList

- Infinite scroll (load older messages)
- `MessageSend` из feature/message
- Scroll to bottom при новых сообщениях

### ChatList

- Список `ChatCard`
- Форматирование времени (`formatChatTime`)

## Бизнес-правила

- Auth widgets редиректят авторизованного пользователя с публичных страниц.
- Списки используют лимиты из `env` (posts, messages).
- Auth-виджеты — flat dark card; не добавлять 3D/Three.js.

## Тесты

Тесты для widget отсутствуют.

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| Список не обновляется после действия | Проверить invalidatesTags в mutation |
| Дублирование постов | Проверить merge logic в usePostList |
| Форма auth не сабмитится | Проверить Zod errors, rate limit state |
