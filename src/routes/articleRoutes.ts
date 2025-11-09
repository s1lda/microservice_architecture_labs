import { Router } from 'express';
import {
  createArticle,
  getArticles,
  getArticleBySlug,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createArticleSchema, updateArticleSchema } from '../utils/validation';

const router = Router();

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Создать новую статью
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 example: How to Build REST APIs
 *               description:
 *                 type: string
 *                 example: A comprehensive guide to building REST APIs
 *               body:
 *                 type: string
 *                 example: Full article content goes here...
 *               tagList:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["nodejs", "typescript", "api"]
 *     responses:
 *       201:
 *         description: Статья успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 article:
 *                   $ref: '#/components/schemas/Article'
 *       401:
 *         description: Не авторизован
 *       400:
 *         description: Ошибка валидации
 */
router.post('/articles', authenticate, validate(createArticleSchema), createArticle);

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Получить список всех статей
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: Список статей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 */
router.get('/articles', getArticles);

/**
 * @swagger
 * /api/articles/{slug}:
 *   get:
 *     summary: Получить статью по slug
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Уникальный slug статьи
 *         example: how-to-build-rest-apis-1699564800000
 *     responses:
 *       200:
 *         description: Данные статьи
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 article:
 *                   $ref: '#/components/schemas/Article'
 *       404:
 *         description: Статья не найдена
 */
router.get('/articles/:slug', getArticleBySlug);

/**
 * @swagger
 * /api/articles/{slug}:
 *   put:
 *     summary: Обновить статью
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Уникальный slug статьи
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Title
 *               description:
 *                 type: string
 *                 example: Updated description
 *               body:
 *                 type: string
 *                 example: Updated content
 *               tagList:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["updated", "tags"]
 *     responses:
 *       200:
 *         description: Статья обновлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 article:
 *                   $ref: '#/components/schemas/Article'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав на изменение этой статьи
 *       404:
 *         description: Статья не найдена
 */
router.put('/articles/:slug', authenticate, validate(updateArticleSchema), updateArticle);

/**
 * @swagger
 * /api/articles/{slug}:
 *   delete:
 *     summary: Удалить статью
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Уникальный slug статьи
 *     responses:
 *       200:
 *         description: Статья удалена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Article deleted successfully
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав на удаление этой статьи
 *       404:
 *         description: Статья не найдена
 */
router.delete('/articles/:slug', authenticate, deleteArticle);

export default router;
