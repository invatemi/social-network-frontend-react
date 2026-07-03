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

- Хук `useMessagePage` — оркестрация чатов, сообщений, socket
- `chatId` из URL params
- См. также [docs/messaging/](../messaging/overview.md)

## Бизнес-правила

- Protected pages не рендерятся до `isAuthInitialized` и `isAuthenticated`.
- `PublicPage` использует `userId` из `useParams`.
- `FriendPage` / `FollowerPage` — опциональный `userId` в URL.

## Тесты

Тесты для page отсутствуют.

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| Белый экран на protected route | Проверить auth state, ProtectedRoute |
| 404 → /error | Проверить path в router.tsx |
| Данные не загружаются | Проверить RTK Query skip conditions |
