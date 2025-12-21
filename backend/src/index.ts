import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import sequelize from './config/sequelize';
import getSwaggerSpec from './config/swagger';
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getSwaggerSpec(), {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Blog Backend API Docs'
}));

// Swagger JSON
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(getSwaggerSpec());
});

// Routes
app.use('/api', articleRoutes);
app.use('/api', commentRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'backend',
    timestamp: new Date().toISOString() 
  });
});

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Blog Backend API (Articles & Comments)',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
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
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} signal received. Starting graceful shutdown...`);
  
  try {
    await sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database (в production используйте миграции)
    await sequelize.sync();
    console.log('Database synchronized.');

    app.listen(PORT, () => {
      console.log(`Backend API is running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

start();
