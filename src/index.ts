import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import sequelize from './config/sequelize';
import swaggerSpec from './config/swagger';
import userRoutes from './routes/userRoutes';
import articleRoutes from './routes/articleRoutes';
import commentRoutes from './routes/commentRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Blog Platform API Docs'
}));

// Swagger JSON
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api', userRoutes);
app.use('/api', articleRoutes);
app.use('/api', commentRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Blog Platform API',
    version: '1.0.0',
    documentation: 'http://localhost:3000/api-docs',
    endpoints: {
      users: {
        register: 'POST /api/users',
        login: 'POST /api/users/login',
        getCurrentUser: 'GET /api/user',
        updateUser: 'PUT /api/user',
      },
      articles: {
        create: 'POST /api/articles',
        getAll: 'GET /api/articles',
        getBySlug: 'GET /api/articles/:slug',
        update: 'PUT /api/articles/:slug',
        delete: 'DELETE /api/articles/:slug',
      },
      comments: {
        add: 'POST /api/articles/:slug/comments',
        getAll: 'GET /api/articles/:slug/comments',
        delete: 'DELETE /api/articles/:slug/comments/:id',
      },
    },
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

export default app;
