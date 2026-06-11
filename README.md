# Social Network Frontend

SPA-клиент социальной платформы на React: авторизация, профили, лента постов, комментарии, друзья, подписчики, личные сообщения и уведомления в реальном времени.

Backend: [social-backend-service](https://github.com/invatemi/social-backend-service)

## Технологический стек

| Категория | Технологии |
|-----------|------------|
| UI | React 19, TypeScript, CSS Modules |
| Сборка | Vite 8 |
| Роутинг | React Router 7 |
| State / API | Redux Toolkit, RTK Query |
| Real-time | Socket.IO Client |
| Формы / валидация | Zod |
| UI primitives | Headless UI |
| 3D (auth screen) | Three.js, React Three Fiber |

## Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (SPA)                       │
│  React + RTK Query + Socket.IO                         │
└────────────┬───────────────────────────┬────────────────┘
             │ HTTP                      │ WebSocket
             │ VITE_API_URL              │ VITE_WS_URL
             ▼                           ▼
    ┌────────────────┐          ┌─────────────────────┐
    │ KrakenD :8080  │          │ notifications :3005 │
    │  API Gateway   │          │   (Socket.IO hub)   │
    └────────┬───────┘          └─────────────────────┘
             │
    auth / user / post / message microservices
```

**Паттерн:** [Feature-Sliced Design (FSD)](https://feature-sliced.design/) — слои `app`, `page`, `widget`, `feature`, `entities`, `shared`.

**Конфигурация:** все URL и UI-параметры задаются через `VITE_*` переменные в `.env` и валидируются в `src/shared/config/env.ts`.

## Структура репозитория

```
social-network-frontend-react/
├── .env.example              # Шаблон конфигурации Vite
├── scripts/
│   ├── setup-env.ps1         # Инициализация .env (Windows)
│   └── setup-env.sh          # Инициализация .env (Linux/macOS)
├── index.html
├── vite.config.ts
│
└── src/
    ├── main.tsx
    ├── app/                  # Store, router, socket, глобальные providers
    │   ├── store/            # RTK Query APIs, auth slice
    │   ├── provider/         # Router, ProtectedRoute
    │   └── lib/              # Socket.IO, realtime cache
    ├── page/                 # Страницы (роуты)
    ├── widget/               # Композитные блоки (PostList, FriendList, …)
    ├── feature/              # Бизнес-логика и UI-фичи
    ├── entities/             # Доменные сущности + API endpoints
    └── shared/               # UI-kit, layouts, config, hooks
        └── config/env.ts     # Централизованная загрузка VITE_* env
```

## Быстрый старт

### Требования

- Node.js 18+
- Запущенный [backend](https://github.com/invatemi/social-backend-service) (`docker compose up`)

### 1. Настройка переменных окружения

```powershell
# Windows
.\scripts\setup-env.ps1
```

```bash
# Linux / macOS
sh scripts/setup-env.sh
```

По умолчанию `.env.example` указывает на локальный backend:

| Переменная | Значение по умолчанию | Назначение |
|------------|----------------------|------------|
| `VITE_API_URL` | `http://localhost:8080` | KrakenD API Gateway |
| `VITE_WS_URL` | `http://localhost:3005` | WebSocket уведомлений |

> Переменные `VITE_*` попадают в browser bundle — не храните в них секреты.

### 2. Установка и запуск

```bash
npm install
npm run dev
```

Приложение: http://localhost:5173

Убедитесь, что в backend `.env` указано `CORS_ORIGINS=http://localhost:5173`.

### 3. Сборка

```bash
npm run build
npm run preview
```

## Конфигурация (`VITE_*`)

| Группа | Переменные | Описание |
|--------|------------|----------|
| API | `VITE_API_URL` | Base URL для RTK Query |
| WebSocket | `VITE_WS_URL` | URL Socket.IO hub |
| Socket.IO | `VITE_SOCKET_*` | Transports, reconnection, retry |
| Сообщения | `VITE_MESSAGES_*`, `VITE_MESSAGE_*` | Пагинация чатов |
| Посты | `VITE_POST_*` | Лимиты ленты и кэш |
| Поиск | `VITE_SEARCH_*` | Debounce и мин. длина запроса |
| UI | `VITE_*_DELAY_MS`, `VITE_*_TIMEOUT_MS` | Таймауты редиректов и refetch |
| Social | `VITE_SOCIAL_*_URL` | Ссылки в футере |

Полный список — в [`.env.example`](.env.example).

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер Vite (:5173) |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Просмотр production-сборки |
| `npm run lint` | ESLint |

## Лицензия

Проект распространяется под лицензией [Apache License 2.0](LICENSE).

Copyright © 2026 [invatemi](https://github.com/invatemi)
