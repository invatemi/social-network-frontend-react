# photos — Instructions

## Локальный запуск

1. Backend: миграции user-service (`photos` / `photo_likes` / `photo_comments`), gateway с `/api/photos*`.
2. Frontend: `npm run dev`.
3. Авторизоваться → сайдбар «Фото» → `/photos`.

## Основные сценарии

### Открыть галерею

1. `AsidePageNav` → `/photos`.
2. `usePhotoPage` → `GET /api/users/me/photos`.
3. `PhotosView` рендерит секции по годам (или empty-state).

### Пополнить галерею

1. Настройки профиля → смена аватара.
2. Backend upsert'ит `Photo` с `isCurrent=true`.
3. Список фото инвалидируется через тег `Photos`.

### Просмотр / лайк / комментарий

1. Клик по карточке → `PhotoModal`.
2. Стрелки / ← → — перелистывание; Escape — закрыть.
3. Лайк: `POST /api/photos/:id/like`.
4. Комментарий: `POST /api/photos/:id/comments`.

### Удаление

1. С карточки или из модалки (только свои).
2. `DELETE /api/photos/:id`.
3. Если фото — текущий аватар → `avatarUrl` сбрасывается.

## PhotosView

| Prop | Назначение |
|------|------------|
| `yearGroups` | Данные секций |
| `onPhotoClick` / `onPhotoDelete` | Открытие модалки / удаление |
| `canDelete` | Показать кнопку удаления |
| `isLoading` / `isError` | Состояния загрузки |

## Тесты

```bash
npm test
```

- `entities/photo/lib/groupPhotosByYear.test.ts`
- `page/shared/PhotosView/PhotosView.test.tsx`
- `page/PhotoPage/lib/usePhotoPage.test.ts`

## Troubleshooting

| Проблема | Действие |
|----------|----------|
| Пустая галерея при наличии аватара | Проверить миграцию seed / сменить аватар ещё раз |
| Нет маршрутов `/api/photos` | Перегенерировать Krakend tmpl и перезапустить gateway |
| Лайк не обновляется в профиле | Проверить инвалидацию тега `Photos` |
