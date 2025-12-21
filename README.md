# Blog Platform - Микросервисная архитектура

## Лабораторная работа №2: Выделение Users в отдельный микросервис

Данная лабораторная работа демонстрирует процесс перехода от монолитной архитектуры к микросервисной с выделением логики пользователей в отдельный сервис.

## 📋 Архитектура

```
                          ┌─────────────────────────────────────────────────┐
                          │              API Gateway (Nginx)                 │
                          │                  Port: 80                        │
                          └─────────────────────────────────────────────────┘
                                    │                          │
                          /api/users/*                   /api/articles/*
                          /api/user                      /api/articles/:slug/comments/*
                                    │                          │
                                    ▼                          ▼
              ┌─────────────────────────────┐    ┌─────────────────────────────┐
              │         users-api           │    │          backend            │
              │     (Users & Auth)          │    │   (Articles & Comments)     │
              │        Port: 3000           │    │        Port: 3000           │
              └─────────────────────────────┘    └─────────────────────────────┘
                          │                                    │
                          ▼                                    ▼
              ┌─────────────────────────────┐    ┌─────────────────────────────┐
              │         db-users            │    │          db-main            │
              │     PostgreSQL 16           │    │      PostgreSQL 16          │
              │    Database: app_users      │    │    Database: app_main       │
              │    Table: users             │    │    Tables: articles,        │
              │                             │    │            comments         │
              └─────────────────────────────┘    └─────────────────────────────┘
```

## 🎯 Цели обучения

- ✅ Выделение части логики монолитного приложения в отдельный микросервис
- ✅ Концепция Data Ownership (каждый сервис владеет своими данными)
- ✅ Проектирование архитектуры без прямых внешних ключей между сервисами
- ✅ Настройка API Gateway (Nginx) для маршрутизации
- ✅ Сетевая конфигурация в Docker Compose

## 🛠 Технологический стек

- **Node.js** - Серверная среда выполнения
- **TypeScript** - Типизированный JavaScript
- **Express** - Веб-фреймворк
- **Sequelize** - ORM для работы с базой данных
- **PostgreSQL** - Реляционная база данных
- **Nginx** - API Gateway
- **Docker** - Контейнеризация

## 🏗️ Структура проекта

```
microservice_architecture_labs/
├── backend/                    # Сервис статей и комментариев
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── users_service/              # Сервис пользователей
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── scripts/                    # Скрипты миграции данных
│   ├── migrate-users.ts
│   └── migrate-articles.ts
│
├── docker-compose.yaml         # Оркестрация всех сервисов
├── nginx.conf                  # Конфигурация API Gateway
└── README.md
```

## 🚀 Быстрый старт

### 1. Запуск всех сервисов

```bash
# Запуск всех сервисов
docker-compose up --build

# Или в фоновом режиме
docker-compose up --build -d
```

### 2. Проверка работоспособности

```bash
# Health check API Gateway
curl http://localhost/health

# Получить список статей
curl http://localhost/api/articles
```

## 📡 API Endpoints

### Users API (маршрутизируется через `/api/users/*` и `/api/user`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/users` | Регистрация пользователя |
| POST | `/api/users/login` | Аутентификация |
| GET | `/api/user` | Получить текущего пользователя |
| PUT | `/api/user` | Обновить текущего пользователя |
| GET | `/api/users/:id` | Получить пользователя по ID |
| POST | `/api/users/batch` | Получить пользователей по массиву ID |

### Backend API (маршрутизируется через `/api/articles/*`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/articles` | Создать статью |
| GET | `/api/articles` | Получить все статьи |
| GET | `/api/articles/:slug` | Получить статью по slug |
| PUT | `/api/articles/:slug` | Обновить статью |
| DELETE | `/api/articles/:slug` | Удалить статью |
| POST | `/api/articles/:slug/comments` | Добавить комментарий |
| GET | `/api/articles/:slug/comments` | Получить комментарии |
| DELETE | `/api/articles/:slug/comments/:id` | Удалить комментарий |

## 🔐 Аутентификация

Оба сервиса используют **общий JWT_SECRET** для подписи и валидации токенов:

1. **users-api** генерирует JWT токен при регистрации/логине
2. **backend** валидирует JWT токен (без обращения к БД пользователей)

## 📝 Примеры запросов

### Регистрация пользователя

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "password123"
  }'
```

### Создание статьи

```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "My First Article",
    "description": "This is my first article",
    "body": "Article content goes here...",
    "tagList": ["nodejs", "typescript"]
  }'
```

### Получение всех статей

```bash
curl http://localhost:3000/api/articles
```

## 🗄 Миграции

### Создание новой миграции

```bash
npx sequelize-cli migration:generate --name migration-name
```

### Применение миграций

```bash
npm run migrate
```

### Откат последней миграции

```bash
npm run migrate:undo
```

## 🧪 Health Check

Проверка состояния приложения:

```bash
curl http://localhost:3000/health
```

## 📊 Схема базы данных

### Users
- id (PK)
- email (unique)
- username (unique)
- password (hashed)
- bio
- image_url
- createdAt
- updatedAt

### Articles
- id (PK)
- slug (unique)
- title
- description
- body
- tagList (array)
- authorId (FK → Users)
- createdAt
- updatedAt

### Comments
- id (PK)
- body
- articleId (FK → Articles)
- authorId (FK → Users)
- createdAt
- updatedAt

## 🔧 Команды NPM

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка TypeScript
- `npm start` - Запуск production версии
- `npm run migrate` - Применение миграций
- `npm run migrate:undo` - Откат миграции

http://95.215.56.139:3000/api-docs/#/
