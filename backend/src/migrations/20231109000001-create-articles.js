'use strict';

/**
 * Миграция для создания таблицы articles
 * 
 * ВАЖНО: В микросервисной архитектуре authorId НЕ имеет внешнего ключа на users,
 * так как таблица users находится в отдельной базе данных (db-users).
 * Связь между статьями и пользователями реализуется через API, не через FK.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('articles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tagList: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: []
      },
      // authorId хранится как число БЕЗ внешнего ключа
      // Это ключевое изменение для микросервисной архитектуры
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
    
    await queryInterface.addIndex('articles', ['slug']);
    await queryInterface.addIndex('articles', ['authorId']);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('articles');
  }
};
