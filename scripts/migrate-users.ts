/**
 * Скрипт миграции данных пользователей из монолитной БД в микросервисную архитектуру
 * 
 * Этот скрипт:
 * 1. Подключается к старой БД (монолит)
 * 2. Извлекает данные пользователей
 * 3. Вставляет их в новую БД users-api
 * 
 * Использование:
 *   npx ts-node scripts/migrate-users.ts
 * 
 * Переменные окружения:
 *   SOURCE_DB_URL - URL старой БД (монолит)
 *   TARGET_DB_URL - URL новой БД (users-api)
 */

import { Sequelize, QueryTypes } from 'sequelize';

interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  bio: string | null;
  image_url: string | null;
  createdAt: Date;
  updatedAt: Date;
}

async function migrateUsers() {
  console.log('🚀 Начало миграции пользователей...\n');

  // Подключение к старой БД (монолит)
  const sourceDbUrl = process.env.SOURCE_DB_URL || 'postgresql://postgres:postgres@localhost:5432/blog_platform_dev';
  const sourceDb = new Sequelize(sourceDbUrl, {
    logging: false,
  });

  // Подключение к новой БД (users-api)
  const targetDbUrl = process.env.TARGET_DB_URL || 'postgresql://app:app@localhost:5433/app_users';
  const targetDb = new Sequelize(targetDbUrl, {
    logging: false,
  });

  try {
    // Проверка подключений
    console.log('📡 Подключение к базам данных...');
    await sourceDb.authenticate();
    console.log('   ✅ Подключено к исходной БД (монолит)');
    
    await targetDb.authenticate();
    console.log('   ✅ Подключено к целевой БД (users-api)\n');

    // Получение пользователей из старой БД
    console.log('📥 Извлечение пользователей из исходной БД...');
    const users = await sourceDb.query<User>(
      'SELECT id, email, username, password, bio, image_url, "createdAt", "updatedAt" FROM users ORDER BY id',
      { type: QueryTypes.SELECT }
    );
    console.log(`   📊 Найдено ${users.length} пользователей\n`);

    if (users.length === 0) {
      console.log('ℹ️  Нет пользователей для миграции.');
      return;
    }

    // Создание таблицы в новой БД (если не существует)
    console.log('🔨 Создание таблицы users в целевой БД...');
    await targetDb.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        bio TEXT,
        image_url VARCHAR(255),
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Таблица создана\n');

    // Миграция пользователей
    console.log('📤 Миграция пользователей...');
    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      try {
        // Проверка существования пользователя
        const existing = await targetDb.query<{ count: string }>(
          'SELECT COUNT(*) as count FROM users WHERE id = :id OR email = :email',
          {
            replacements: { id: user.id, email: user.email },
            type: QueryTypes.SELECT,
          }
        );

        if (parseInt(existing[0].count) > 0) {
          console.log(`   ⏭️  Пользователь ${user.username} (ID: ${user.id}) уже существует, пропуск`);
          skippedCount++;
          continue;
        }

        // Вставка пользователя с сохранением ID
        await targetDb.query(`
          INSERT INTO users (id, email, username, password, bio, image_url, "createdAt", "updatedAt")
          VALUES (:id, :email, :username, :password, :bio, :image_url, :createdAt, :updatedAt)
        `, {
          replacements: {
            id: user.id,
            email: user.email,
            username: user.username,
            password: user.password,
            bio: user.bio,
            image_url: user.image_url,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });

        console.log(`   ✅ Мигрирован: ${user.username} (ID: ${user.id})`);
        migratedCount++;
      } catch (error) {
        console.error(`   ❌ Ошибка миграции пользователя ${user.username}:`, error);
      }
    }

    // Обновление последовательности ID
    console.log('\n🔄 Обновление последовательности ID...');
    await targetDb.query(`
      SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))
    `);
    console.log('   ✅ Последовательность обновлена\n');

    // Итоги
    console.log('📊 Результаты миграции:');
    console.log(`   ✅ Мигрировано: ${migratedCount}`);
    console.log(`   ⏭️  Пропущено: ${skippedCount}`);
    console.log(`   📝 Всего: ${users.length}`);

  } catch (error) {
    console.error('\n❌ Ошибка миграции:', error);
    process.exit(1);
  } finally {
    await sourceDb.close();
    await targetDb.close();
    console.log('\n🔌 Соединения закрыты');
  }

  console.log('\n✨ Миграция завершена успешно!');
}

migrateUsers();
