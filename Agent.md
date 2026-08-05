# Agent.md — Навигация по документации social-network-frontend-react

Корневой индекс для AI-агентов и разработчиков. Описывает архитектуру SPA-клиента социальной сети на React + FSD.

## Как пользоваться документацией

1. Начните с [architecture-guidelines.md](docs/rules/architecture-guidelines.md) — FSD-слои, потоки данных, связь с backend.
2. Прочитайте [api-conventions.md](docs/rules/api-conventions.md) и [coding-standards.md](docs/rules/coding-standards.md) перед изменением кода.
3. Перейдите к `overview.md` нужного слоя или домена, затем к `instructions.md` для практических сценариев.

## Дерево `/docs`

```
docs/
├── rules/
│   ├── architecture-guidelines.md
│   ├── api-conventions.md
│   └── coding-standards.md
├── app/
│   ├── overview.md
│   └── instructions.md
├── page/
│   ├── overview.md
│   └── instructions.md
├── widget/
│   ├── overview.md
│   └── instructions.md
├── feature/
│   ├── overview.md
│   └── instructions.md
├── entities/
│   ├── overview.md
│   └── instructions.md
├── shared/
│   ├── overview.md
│   └── instructions.md
├── auth/
│   ├── overview.md
│   └── instructions.md
├── messaging/
│   ├── overview.md
│   └── instructions.md
└── photos/
    ├── overview.md
    └── instructions.md
```

## Глобальные правила

| Файл | Описание |
|------|----------|
| [docs/rules/architecture-guidelines.md](docs/rules/architecture-guidelines.md) | FSD-слои, зависимости, state management, Socket.IO, схема взаимодействия с backend. |
| [docs/rules/api-conventions.md](docs/rules/api-conventions.md) | RTK Query, Bearer + HttpOnly refresh, rate limit 429, маппинг API-модулей. |
| [docs/rules/coding-standards.md](docs/rules/coding-standards.md) | Структура слайсов, TypeScript, CSS Modules, нейминг, валидация Zod. |

## FSD-слои

### app

| Файл | Описание |
|------|----------|
| [docs/app/overview.md](docs/app/overview.md) | Store, router, AuthBootstrap, ProtectedRoute, socket hub. |
| [docs/app/instructions.md](docs/app/instructions.md) | Запуск, добавление RTK endpoints, socket-события, troubleshooting. |

### page

| Файл | Описание |
|------|----------|
| [docs/page/overview.md](docs/page/overview.md) | 12 страниц, карта маршрутов, композиция слоёв. |
| [docs/page/instructions.md](docs/page/instructions.md) | Как добавить страницу, шаблон, сценарии MainPage/MessagePage. |

### widget

| Файл | Описание |
|------|----------|
| [docs/widget/overview.md](docs/widget/overview.md) | 9 виджетов: PostList, ChatList, Autorization и др. |
| [docs/widget/instructions.md](docs/widget/instructions.md) | Widget vs feature, controlled/uncontrolled списки. |

### feature

| Файл | Описание |
|------|----------|
| [docs/feature/overview.md](docs/feature/overview.md) | 10 feature-слайсов: post, friend, message, notifications и др. |
| [docs/feature/instructions.md](docs/feature/instructions.md) | Добавление feature, связь с entities API, useSocket. |

### entities

| Файл | Описание |
|------|----------|
| [docs/entities/overview.md](docs/entities/overview.md) | 9 сущностей, UI-карточки, RTK Query injectEndpoints. |
| [docs/entities/instructions.md](docs/entities/instructions.md) | Как добавить entity, tags, ключевые endpoints. |

### shared

| Файл | Описание |
|------|----------|
| [docs/shared/overview.md](docs/shared/overview.md) | UI-kit, layouts, env config, rate-limit utils. |
| [docs/shared/instructions.md](docs/shared/instructions.md) | Env-группы, добавление shared-компонента, Toast. |

## Доменные модули

### auth

| Файл | Описание |
|------|----------|
| [docs/auth/overview.md](docs/auth/overview.md) | Сквозной flow: login, register, bootstrap, refresh, logout, multi-account vault. |
| [docs/auth/instructions.md](docs/auth/instructions.md) | Сценарии auth (в т.ч. add/switch), QA-чеклист, troubleshooting CORS/401. |

### messaging

| Файл | Описание |
|------|----------|
| [docs/messaging/overview.md](docs/messaging/overview.md) | Чаты, MessagesView, socket, useMessagePage, визуальные токены. |
| [docs/messaging/instructions.md](docs/messaging/instructions.md) | Сценарии, CreateChat labeled, тесты Vitest, troubleshooting WS. |

### photos

| Файл | Описание |
|------|----------|
| [docs/photos/overview.md](docs/photos/overview.md) | Галерея /photos, PhotosView, локальные preview. |
| [docs/photos/instructions.md](docs/photos/instructions.md) | Upload UI-only, группировка по годам, тесты. |

## Инфраструктура (вне `/docs`)

| Компонент | Путь в репозитории |
|-----------|-------------------|
| Vite config | `vite.config.ts` |
| TypeScript | `tsconfig.json`, `tsconfig.app.json` |
| Env template | `.env.example` |
| Env setup scripts | `scripts/setup-env.ps1`, `scripts/setup-env.sh` |
| ESLint | `eslint.config.js` |
| Backend (отдельный репо) | [social-backend-service](https://github.com/invatemi/social-backend-service) |

## Стек (кратко)

React 19 · TypeScript · Vite 8 · React Router 7 · Redux Toolkit · RTK Query · Socket.IO Client · Zod · CSS Modules · Headless UI · Vitest

## UI-система

Единая тёмная flat-тема: токены в `src/app/style/index.css`, Inter (Google Fonts), shared UI-kit (`Button`, `Input`, `Spinner`, icons). Auth — flat card без Three.js. Документация токенов: [docs/shared/overview.md](docs/shared/overview.md).

## URL и порты по умолчанию

| Компонент | URL |
|-----------|-----|
| Vite dev server | http://localhost:5173 |
| KrakenD API (`VITE_API_URL`) | http://localhost:8088 |
| Socket.IO (`VITE_WS_URL`) | http://localhost:3005 |

## Backend-документация

Контракты API и микросервисы — в репозитории backend: [Agent.md](https://github.com/invatemi/social-backend-service/blob/main/Agent.md).
