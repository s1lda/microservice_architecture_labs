# Blog Platform Backend

Бэкенд-приложение для блог-платформы, разработанное с использованием Node.js, TypeScript, Express, Sequelize и PostgreSQL.

## 🛠 Технологический стек

- **Node.js** - Серверная среда выполнения
- **TypeScript** - Типизированный JavaScript
- **Express** - Веб-фреймворк
- **Sequelize** - ORM для работы с базой данных
- **PostgreSQL** - Реляционная база данных
- **jsonwebtoken** - JWT аутентификация
- **zod** - Валидация данных
- **bcrypt** - Хеширование паролей
- **Swagger** - API документация
- **Docker** - Контейнеризация приложения

## 📚 API Документация

После запуска приложения, Swagger документация доступна по адресу:

**http://localhost:3000/api-docs**

В Swagger UI вы можете:
- Просмотреть все доступные endpoints
- Протестировать API прямо из браузера
- Увидеть структуру запросов и ответов
- Использовать JWT токен для авторизации

## 📋 Функциональность

### Управление пользователями
- `POST /api/users` - Регистрация нового пользователя
- `POST /api/users/login` - Аутентификация пользователя
- `GET /api/user` - Получение текущего пользователя (защищённый маршрут)
- `PUT /api/user` - Обновление данных пользователя (защищённый маршрут)

### Управление статьями
- `POST /api/articles` - Создание статьи (защищённый маршрут)
- `GET /api/articles` - Получение списка всех статей
- `GET /api/articles/:slug` - Получение статьи по slug
- `PUT /api/articles/:slug` - Обновление статьи (защищённый маршрут)
- `DELETE /api/articles/:slug` - Удаление статьи (защищённый маршрут)

### Комментарии
- `POST /api/articles/:slug/comments` - Добавление комментария (защищённый маршрут)
- `GET /api/articles/:slug/comments` - Получение комментариев к статье
- `DELETE /api/articles/:slug/comments/:id` - Удаление комментария (защищённый маршрут)

## 🚀 Быстрый старт

### Предварительные требования
- Node.js (v20 или выше)
- PostgreSQL (v16 или выше)
- Docker и Docker Compose (опционально)

### Установка зависимостей

```bash
npm install
```

### Настройка окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` файл с вашими настройками:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=blog_platform_dev

JWT_SECRET=your-secret-key-change-in-production
```

### Запуск базы данных (Docker)

Для локальной разработки можно запустить только PostgreSQL:

```bash
docker-compose -f docker-compose.dev.yaml up -d
```

### Миграции базы данных

```bash
npm run migrate
```

### Запуск приложения

#### Режим разработки
```bash
npm run dev
```

#### Продакшн режим
```bash
npm run build
npm start
```

## 🐳 Docker

### Запуск полного стека (приложение + база данных)

```bash
docker-compose --profile full up -d
```

### Запуск только базы данных для разработки

```bash
docker-compose up db
```

или

```bash
docker-compose -f docker-compose.dev.yaml up -d
```

### Остановка контейнеров

```bash
docker-compose down
```

### Остановка с удалением volumes

```bash
docker-compose down -v
```

## 📁 Структура проекта

```
.
├── src/
│   ├── config/          # Конфигурация БД и Sequelize
│   ├── controllers/     # Контроллеры для обработки запросов
│   ├── middleware/      # Middleware (auth, validation)
│   ├── migrations/      # Миграции базы данных
│   ├── models/          # Модели Sequelize
│   ├── routes/          # Определение маршрутов
│   ├── utils/           # Утилиты (JWT, валидация)
│   └── index.ts         # Точка входа приложения
├── .env.example         # Пример переменных окружения
├── .sequelizerc         # Конфигурация Sequelize CLI
├── docker-compose.yaml  # Docker Compose для полного стека
├── docker-compose.dev.yaml  # Docker Compose для разработки
├── Dockerfile           # Dockerfile для приложения
├── package.json         # Зависимости проекта
└── tsconfig.json        # Конфигурация TypeScript
```

## 🔐 Аутентификация

API использует JWT (JSON Web Tokens) для аутентификации. 

### Получение токена

После регистрации или входа, вы получите JWT токен в ответе:

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Использование токена

Для защищённых маршрутов добавьте токен в заголовок:

```
Authorization: Bearer <your-token>
```

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

## 📄 Лиценза

ISC
