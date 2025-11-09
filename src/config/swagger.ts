import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const getSwaggerSpec = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  console.log('Generating Swagger spec:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- API_URL:', process.env.API_URL);
  console.log('- isDev:', isDev);

  const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog Platform API',
      version: '1.0.0',
      description: 'REST API для блог-платформы с аутентификацией и управлением статьями',
      contact: {
        name: 'API Support',
        email: 'support@blogplatform.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: isDev 
          ? `http://localhost:${process.env.PORT || 3000}`
          : (process.env.API_URL || 'http://localhost:3000'),
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Введите JWT токен, полученный после логина'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID пользователя',
              example: 1
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя',
              example: 'user@example.com'
            },
            username: {
              type: 'string',
              description: 'Имя пользователя',
              example: 'johndoe'
            },
            bio: {
              type: 'string',
              description: 'Биография пользователя',
              example: 'Software developer',
              nullable: true
            },
            image_url: {
              type: 'string',
              description: 'URL аватара пользователя',
              example: 'https://example.com/avatar.jpg',
              nullable: true
            },
            token: {
              type: 'string',
              description: 'JWT токен',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        },
        Article: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID статьи',
              example: 1
            },
            slug: {
              type: 'string',
              description: 'Уникальный slug статьи',
              example: 'how-to-build-rest-apis-1699564800000'
            },
            title: {
              type: 'string',
              description: 'Заголовок статьи',
              example: 'How to Build REST APIs'
            },
            description: {
              type: 'string',
              description: 'Краткое описание статьи',
              example: 'A comprehensive guide to building REST APIs'
            },
            body: {
              type: 'string',
              description: 'Полный текст статьи',
              example: 'Full article content goes here...'
            },
            tagList: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Список тегов',
              example: ['nodejs', 'typescript', 'api']
            },
            author: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                username: { type: 'string', example: 'johndoe' },
                bio: { type: 'string', example: 'Software developer' },
                image_url: { type: 'string', example: 'https://example.com/avatar.jpg' }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата последнего обновления'
            }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID комментария',
              example: 1
            },
            body: {
              type: 'string',
              description: 'Текст комментария',
              example: 'Great article! Very helpful.'
            },
            author: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                username: { type: 'string', example: 'johndoe' },
                bio: { type: 'string', example: 'Software developer' },
                image_url: { type: 'string', example: 'https://example.com/avatar.jpg' }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата последнего обновления'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Сообщение об ошибке',
              example: 'Validation failed'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email format' }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Users',
        description: 'Управление пользователями и аутентификация'
      },
      {
        name: 'Articles',
        description: 'Управление статьями'
      },
      {
        name: 'Comments',
        description: 'Управление комментариями'
      }
    ]
  },
  apis: isDev 
    ? ['./src/routes/*.ts']
    : [path.join(__dirname, '../routes/*.js')]
  };

  return swaggerJsdoc(options);
};

export default getSwaggerSpec;
