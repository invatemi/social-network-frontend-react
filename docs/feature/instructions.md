# feature — Instructions

## Как добавить feature

1. Создать `src/feature/<name>/`:
   ```
   <name>/
   ├── ui/           # опционально
   ├── hooks/        # опционально
   ├── lib/
   └── index.ts
   ```

2. Использовать entities API, не дублировать HTTP-логику.
3. Экспортировать public API из `index.ts` слайса.
4. Добавить экспорт в `src/feature/index.ts`.

## Связь feature → entities API

| Feature | Entities API |
|---------|--------------|
| post | postApi (`useCreatePostMutation`) |
| comment | commentApi |
| friend | friendApi |
| message | messagesApi (`useSendMessageMutation`) |
| chat | messagesApi (`useCreateChatMutation`) |
| notifications | notificationsApi (app/store) |
| profile | userApi, friendApi, followersApi |
| user | searchApi |
| user-detail | userApi, codeApi (password) |

## Основные сценарии

### CreatePost

- Форма с текстом/изображением
- `useCreatePostMutation` → invalidate `Feed`, `Posts`

### CreateFriend

- Кнопка на PublicPage
- `useCreateFriend` → friend request mutation
- Обновление FriendStatus tags

### NotificationButton

- Polling / refetch incoming requests
- Modal со списком NotificationItem
- Accept/decline через friendApi

### useSocket

```typescript
useSocket('message:new', (message) => {
  // handler
});
```

Подписывается на события через `getSocket()` из app.

### useUserProfile

Агрегирует:
- `useGetUserProfileQuery` (свой профиль)
- Данные друзей/подписчиков при необходимости

### Profile settings (user-detail)

- `ProfileMenu` — popover у кнопки в `AsidePageNav` (logout, настройки, добавить аккаунт)
- `SettingsModal` — редактирование никнейма/email/статуса/локации, аватар, смена пароля
- `ProfileSettingsProvider` — единый `openSettings()` для aside и ProfileView
- Устаревшие роуты `/user/settings` и `/user/settings/password` редиректят на `/user`

## Бизнес-правила

- Rate limit на auth/register — countdown перед повторной отправкой.
- `useAvatarUpload` — отдельный flow загрузки файла.
- Search: debounce из `env.search.debounceMs`, min length из `env.search.minQueryLength`.

## Тесты

- `ProfileMenu.test.tsx` — открытие/закрытие меню, переход в настройки
- `SettingsModal.test.tsx` — поля профиля, overlay, шаг смены пароля

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| Действие не отражается в UI | Проверить invalidatesTags |
| useSocket не срабатывает | Проверить initSocket, chat:join для комнат |
| Profile не обновляется | Проверить updateUser в authSlice после save |
