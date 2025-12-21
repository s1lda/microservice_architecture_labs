require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'app',
    password: process.env.DB_PASSWORD || 'app',
    database: process.env.DB_NAME || 'app_users',
    host: process.env.DB_HOST || 'db-users',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USER || 'app',
    password: process.env.DB_PASSWORD || 'app',
    database: process.env.DB_NAME || 'app_users',
    host: process.env.DB_HOST || 'db-users',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres'
  }
};
