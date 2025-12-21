'use strict';

/**
 * Миграция для создания таблицы comments
 * 
 * ВАЖНО: authorId НЕ имеет внешнего ключа на users,
 * так как таблица users находится в отдельной базе данных (db-users).
 * Связь между комментариями и пользователями реализуется через API, не через FK.
 * 
 * articleId имеет FK на articles, так как обе таблицы в одной БД.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      articleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'articles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // authorId хранится как число БЕЗ внешнего ключа
      // Связь с пользователем реализуется через API, не через БД
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false
        // Убран references на users - users теперь в отдельном микросервисе
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    
    await queryInterface.addIndex('comments', ['articleId']);
    await queryInterface.addIndex('comments', ['authorId']);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('comments');
  }
};
