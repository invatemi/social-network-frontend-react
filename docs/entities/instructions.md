# entities — Instructions

## Как добавить новую entity

1. Создать папку `src/entities/<name>/`:
   ```
   <name>/
   ├── lib/
   │   ├── types.ts
   │   └── index.ts
   ├── ui/
   │   └── <Name>Card.tsx
   ├── api/
   │   └── <name>Api.ts
   └── index.ts
   ```

2. В `api/<name>Api.ts`:
   ```typescript
   import { baseApi } from "@/app/store/api/baseApi";

   export const nameApi = baseApi.injectEndpoints({
     endpoints: (builder) => ({
       // ...
     }),
     overrideExisting: false,
   });

   export const { useGetXxxQuery } = nameApi;
   ```

3. Указать `providesTags` / `invalidatesTags` (см. существующие API).
4. Экспортировать UI из `index.ts` слайса.
5. Добавить экспорт в `src/entities/index.ts`.

## Ключевые endpoints (кратко)

### userApi

| Hook | Метод | Путь |
|------|-------|------|
| `useGetUserProfileQuery` | GET | `/api/users/me` |
| `useGetUserPublicProfileQuery` | GET | `/api/users/:id` |
| `useUpdateUserProfileMutation` | PATCH | `/api/users/me` |

### postApi

| Hook | Описание |
|------|----------|
| `useGetFeedPostsQuery` | Лента |
| `useCreatePostMutation` | Создание |
| `useLikePostMutation` | Лайк |
| `useDeletePostMutation` | Удаление |

### messagesApi

| Hook | Описание |
|------|----------|
| `useGetChatsQuery` | Список чатов |
| `useGetMessagesQuery` | Сообщения чата |
| `useSendMessageMutation` | Отправка |
| `useForwardMessagesMutation` | Пересылка |
| `useEditMessageMutation` | Редактирование |
| `useDeleteMessageMutation` | Удаление сообщения |
| `useDeleteMessagesBulkMutation` | Bulk delete |
| `useCreateChatMutation` | Создание чата |
| `useDeleteChatMutation` | Удаление чата |

Полные сигнатуры — в исходных файлах `entities/*/api/`.

## RTK Query tags

При добавлении endpoints учитывайте существующие tag types в `baseApi.ts`:

`User`, `Posts`, `Comments`, `Auth`, `Friends`, `Feed`, `UserOnline`, `FriendStatus`, `UserMe`, `Chat`, `Chats`, `Messages`, `Message`.

Новый домен — добавить tag type в `baseApi.ts` и обновить socket handlers при необходимости.

## Бизнес-правила

- Поиск (`searchApi`): endpoint `searchUsers` не отправляет Bearer token.
- Пагинация постов: offset через `env.posts.defaultFeedLimit`.
- Сообщения: лимиты из `env.messages.*`.

## Тесты

Тесты для entities отсутствуют.

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| Кэш не обновляется | Проверить tags в provides/invalidates и socket handlers |
| 401 на защищённых endpoints | Проверить auth flow (см. docs/auth/) |
| Дублирование данных в списках | Использовать `merge`/`forceRefetch` в query options |
