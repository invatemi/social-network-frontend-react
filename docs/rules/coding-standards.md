# Стандарты кода

Правила для TypeScript/React-кода в `social-network-frontend-react`. Дополняют [architecture-guidelines.md](architecture-guidelines.md) и [api-conventions.md](api-conventions.md).

## Структура слайса FSD

Типичная структура слайса:

```
<slice>/
├── ui/           # React-компоненты + *.module.css
├── hooks/        # Кастомные хуки
├── lib/          # Типы, утилиты, константы
├── api/          # RTK Query injectEndpoints (entities)
└── index.ts      # Public API слайса
```

### Обязательно

- Экспорт наружу только через `index.ts` слоя (`@/page`, `@/widget`, `@/feature`, `@/entities`, `@/shared`).
- Импорты между слоями — только сверху вниз по FSD.
- Стили — CSS Modules (`.module.css`) на глобальных токенах из `src/app/style/index.css` (`var(--color-*)`, `var(--radius-*)`, `var(--ease-out)`).

### Запрещено

- Хранить секреты в `VITE_*` переменных (они попадают в browser bundle).
- Коммитить `.env` (только `.env.example`).
- Импортировать из внутренних путей слайса, минуя public API, без веской причины.
- Courier New / ASCII terminal UI (`[loading...]`, `> prompt`, fake progress bars).
- Хардкод цветов вместо CSS-переменных (кроме редких одноразовых акцентов в domain icons).

## TypeScript

- `strict: true` в `tsconfig.app.json`.
- Типизированные хуки: `useAppDispatch`, `useAppSelector` из `src/app/store/hooks.ts`.
- Типы домена — в `entities/<slice>/lib/`.

## Нейминг

| Элемент | Конвенция | Пример |
|---------|-----------|--------|
| Компоненты | PascalCase | `PostCard`, `CreatePost` |
| Хуки | camelCase с `use` | `useCreatePost`, `useMessagePage` |
| RTK hooks | `useXxxQuery`, `useXxxMutation` | `useGetFeedPostsQuery` |
| CSS Modules | `Component.module.css` | `PostCard.module.css` |
| Слайсы Redux | camelCase | `authSlice` |

### Legacy

Опечатка `Autorization` (вместо `Authorization`) зафиксирована в роуте `/autorization`, widget и page. Не переименовывать без отдельной миграции.

## Валидация форм

- Zod-схемы в `lib/` слайса widget/feature.
- Ошибки валидации отображаются в UI формы.

## Обработка ошибок API

- RTK Query: `isError`, `error` в хуках; для мутаций — `unwrap()` в try/catch.
- Rate limit (429): `useRateLimitCountdown` + Toast.
- Auth (401): обрабатывается автоматически в `customBaseQuery`.

## RTK Query

- Новые endpoints — через `baseApi.injectEndpoints` в `entities/*/api` или `app/store/api`.
- Указывать `providesTags` / `invalidatesTags` для корректной инвалидации кэша.
- Для горячих списков предпочитать `updateQueryData` вместо широкой invalidation (см. `message:new` в `socket.ts`).
- Поиск пользователей (`searchUsers`) — без Bearer token в headers.

## Performance

- Leaf cards (`MessageCard`, `ChatCard`, `PostCard`, `CommentCard`) — `React.memo`.
- Списки MessageList / PostList — windowing через `useWindowedRange` + `content-visibility`.
- Presence: селектор `selectIsUserOnline` per-row; не подписывать весь `presence.byUserId`.
- Анимации: `usePrefersReducedMotion` / `useEnterAnimation` в `shared/hooks`; CSS Modules, без animation libraries.
- Feed cache: `getFeedPosts` merge capped (`env.posts.maxFeedItems`).

## Логирование

- `console.log` / `console.error` допустимы для socket и dev-отладки.
- В production не логировать токены и персональные данные.

## Тестирование

Vitest + React Testing Library + jsdom (`npm test` / `npm run test:watch`).

Покрытие точечное: MessagesView, PhotosView, ProfileMenu, SettingsModal, hooks Message/Photo, `groupPhotosByYear`. Новые UI-сценарии — добавлять тесты рядом с модулем (`*.test.ts(x)`).

## Git и изменения

- Минимальный scope diff — только затронутые слайсы.
- Новый слайс: создать структуру + экспорт в `index.ts` слоя.
- Документация: обновлять `docs/` при изменении архитектуры или публичных контрактов.
