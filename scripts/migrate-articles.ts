/**
 * Скрипт миграции статей и комментариев в новую структуру БД
 * 
 * Этот скрипт:
 * 1. Подключается к старой БД (монолит)
 * 2. Извлекает данные статей и комментариев
 * 3. Вставляет их в новую БД backend (без FK на users)
 * 
 * Использование:
 *   npx ts-node scripts/migrate-articles.ts
 */

import { Sequelize, QueryTypes } from 'sequelize';

interface Article {
  id: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Comment {
  id: number;
  body: string;
  articleId: number;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}

async function migrateArticles() {
  console.log('🚀 Начало миграции статей и комментариев...\n');

  // Подключение к старой БД (монолит)
  const sourceDbUrl = process.env.SOURCE_DB_URL || 'postgresql://postgres:postgres@localhost:5432/blog_platform_dev';
  const sourceDb = new Sequelize(sourceDbUrl, {
    logging: false,
  });

  // Подключение к новой БД (backend)
  const targetDbUrl = process.env.TARGET_DB_URL || 'postgresql://app:app@localhost:5434/app_main';
  const targetDb = new Sequelize(targetDbUrl, {
    logging: false,
  });

  try {
    // Проверка подключений
    console.log('📡 Подключение к базам данных...');
    await sourceDb.authenticate();
    console.log('   ✅ Подключено к исходной БД (монолит)');
    
    await targetDb.authenticate();
    console.log('   ✅ Подключено к целевой БД (backend)\n');

    // Создание таблиц в новой БД
    console.log('🔨 Создание таблиц в целевой БД...');
    
    // Таблица articles (без FK на users)
    await targetDb.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        body TEXT NOT NULL,
        "tagList" TEXT[] DEFAULT '{}',
        "authorId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Таблица articles создана');

    // Индексы для articles
    await targetDb.query(`CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)`);
    await targetDb.query(`CREATE INDEX IF NOT EXISTS idx_articles_authorId ON articles("authorId")`);

    // Таблица comments (без FK на users, но с FK на articles)
    await targetDb.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        body TEXT NOT NULL,
        "articleId" INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        "authorId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Таблица comments создана\n');

    // Индексы для comments
    await targetDb.query(`CREATE INDEX IF NOT EXISTS idx_comments_articleId ON comments("articleId")`);
    await targetDb.query(`CREATE INDEX IF NOT EXISTS idx_comments_authorId ON comments("authorId")`);

    // Миграция статей
    console.log('📥 Извлечение статей из исходной БД...');
    const articles = await sourceDb.query<Article>(
      'SELECT id, slug, title, description, body, "tagList", "authorId", "createdAt", "updatedAt" FROM articles ORDER BY id',
      { type: QueryTypes.SELECT }
    );
    console.log(`   📊 Найдено ${articles.length} статей\n`);

    console.log('📤 Миграция статей...');
    let migratedArticles = 0;

    for (const article of articles) {
      try {
        const existing = await targetDb.query<{ count: string }>(
          'SELECT COUNT(*) as count FROM articles WHERE id = :id',
          { replacements: { id: article.id }, type: QueryTypes.SELECT }
        );

        if (parseInt(existing[0].count) > 0) {
          console.log(`   ⏭️  Статья ${article.slug} уже существует, пропуск`);
          continue;
        }

        await targetDb.query(`
          INSERT INTO articles (id, slug, title, description, body, "tagList", "authorId", "createdAt", "updatedAt")
          VALUES (:id, :slug, :title, :description, :body, :tagList, :authorId, :createdAt, :updatedAt)
        `, {
          replacements: {
            id: article.id,
            slug: article.slug,
            title: article.title,
            description: article.description,
            body: article.body,
            tagList: article.tagList || [],
            authorId: article.authorId,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
          },
        });

        console.log(`   ✅ Мигрирована статья: ${article.slug}`);
        migratedArticles++;
      } catch (error) {
        console.error(`   ❌ Ошибка миграции статьи ${article.slug}:`, error);
      }
    }

    // Миграция комментариев
    console.log('\n📥 Извлечение комментариев из исходной БД...');
    const comments = await sourceDb.query<Comment>(
      'SELECT id, body, "articleId", "authorId", "createdAt", "updatedAt" FROM comments ORDER BY id',
      { type: QueryTypes.SELECT }
    );
    console.log(`   📊 Найдено ${comments.length} комментариев\n`);

    console.log('📤 Миграция комментариев...');
    let migratedComments = 0;

    for (const comment of comments) {
      try {
        const existing = await targetDb.query<{ count: string }>(
          'SELECT COUNT(*) as count FROM comments WHERE id = :id',
          { replacements: { id: comment.id }, type: QueryTypes.SELECT }
        );

        if (parseInt(existing[0].count) > 0) {
          console.log(`   ⏭️  Комментарий ID ${comment.id} уже существует, пропуск`);
          continue;
        }

        await targetDb.query(`
          INSERT INTO comments (id, body, "articleId", "authorId", "createdAt", "updatedAt")
          VALUES (:id, :body, :articleId, :authorId, :createdAt, :updatedAt)
        `, {
          replacements: {
            id: comment.id,
            body: comment.body,
            articleId: comment.articleId,
            authorId: comment.authorId,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
          },
        });

        console.log(`   ✅ Мигрирован комментарий ID: ${comment.id}`);
        migratedComments++;
      } catch (error) {
        console.error(`   ❌ Ошибка миграции комментария ${comment.id}:`, error);
      }
    }

    // Обновление последовательностей
    console.log('\n🔄 Обновление последовательностей ID...');
    await targetDb.query(`SELECT setval('articles_id_seq', COALESCE((SELECT MAX(id) FROM articles), 1))`);
    await targetDb.query(`SELECT setval('comments_id_seq', COALESCE((SELECT MAX(id) FROM comments), 1))`);
    console.log('   ✅ Последовательности обновлены\n');

    // Итоги
    console.log('📊 Результаты миграции:');
    console.log(`   ✅ Статей мигрировано: ${migratedArticles}`);
    console.log(`   ✅ Комментариев мигрировано: ${migratedComments}`);

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

migrateArticles();
