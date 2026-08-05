# page — Instructions

## Как добавить новую страницу

1. Создать слайс `src/page/<Name>Page/`:
   ```
   <Name>Page/
   ├── <Name>Page.tsx
   ├── <Name>Page.module.css   # опционально
   └── index.ts
   ```

2. Экспортировать из `src/page/index.ts`.

3. Добавить маршрут в `src/app/provider/router/router.tsx`:
   - Публичный: `<Route path="..." element={<NamePage />} />`
   - Защищённый: внутри `<Route element={<ProtectedOutlet />}>` 

4. При необходимости добавить пункт в `AsidePageNav` (`shared/ui/AsidePageNav`).

## Шаблон страницы

```tsx
import { PageLayout } from "@/shared/layouts";
import { SomeWidget } from "@/widget";

export const ExamplePage = () => {
  return (
    <PageLayout title="Example">
      <SomeWidget />
    </PageLayout>
  );
};
```

## Основные сценарии

### MainPage (лента)

- `useGetFeedPostsQuery` с лимитом из `env.posts.defaultFeedLimit`
- `PostList` в controlled или uncontrolled режиме

### UserPage (свой профиль)

- `useUserProfile` из feature/profile
- `CreatePost` + `PostList` с постами пользователя

### MessagePage

- Хук `useMessagePage` — оркестрация чатов, сообщений, socket, **sync с `/messages/:chatId`**
- Layout-shell: `src/page/shared/MessagesView/` (как `PeopleRelationsView` для друзей)
- Idle: список чатов + labeled CTA «Новый чат»; active: 3 колонки (список / тред / `ChatDetailsPanel`)
- См. также [docs/messaging/](../messaging/overview.md)

### PhotoPage

- Роут `/photos`; сайдбар «Фото» → `/photos` (профиль остаётся на `/user`)
- Layout-shell: `src/page/shared/PhotosView/`
- Хук `usePhotoPage` — локальные object URL, группировка по годам; **без server persistence**
- См. также [docs/photos/](../photos/overview.md)

### FriendPage / FollowerPage

Общий shell: `src/page/shared/PeopleRelationsView/` (поиск, табы Все/Онлайн, правое сабменю).

- `/friends`, `/friends/:userId?` — друзья; `?section=requests` — входящие заявки (только без `userId`)
- `/followers`, `/followers/:userId?` — подписки
- Online-фильтр — клиентский, через `presenceSlice`
- Поиск на своей `/friends` (без `:userId`, не в заявках): debounce + `useFriendsPeopleSearch` → два блока — подходящие друзья (клиентский filter по `username`) и «Другие пользователи» (`GET /api/users/search`, без себя и уже известных друзей) с `CreateFriend`
- На `/friends/:userId`, `?section=requests` и `/followers` — поиск по-прежнему клиентский по `username`
- Карточки: `FriendCard` / `FollowerCard` (online-dot, «Написать сообщение» → createChat); блок других — `PeopleSearchCard` + `CreateFriend`
- UI поиска: `src/page/FriendPage/ui/FriendsSearchResults/`

Страницы визуально близнецы; отличаются данными и `activeSection` сабменю.

## Бизнес-правила

- Protected pages не рендерятся до `isAuthInitialized` и `isAuthenticated`.
- `PublicPage` использует `userId` из `useParams`.
- `FriendPage` / `FollowerPage` — опциональный `userId` в URL; `section=requests` не использовать вместе с `:userId`.

## Тесты

```bash
npm test
```

- `src/page/shared/MessagesView/MessagesView.test.tsx`
- `src/page/MessagePage/lib/useMessagePage.test.ts`
- `src/page/shared/PhotosView/PhotosView.test.tsx`
- `src/page/PhotoPage/lib/usePhotoPage.test.ts`
- `src/page/FriendPage/lib/useFriendsPeopleSearch.test.ts`
- `src/page/FriendPage/ui/FriendsSearchResults/FriendsSearchResults.test.tsx`

Остальные page-слайсы без тестов.

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| Белый экран на protected route | Проверить auth state, ProtectedRoute |
| 404 → /error | Проверить path в router.tsx |
| Данные не загружаются | Проверить RTK Query skip conditions |
