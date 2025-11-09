import { Router } from 'express';
import { addComment, getComments, deleteComment } from '../controllers/commentController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema } from '../utils/validation';

const router = Router();

/**
 * @swagger
 * /api/articles/{slug}/comments:
 *   post:
 *     summary: Добавить комментарий к статье
 *     tags: [Comments]
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
 *             required:
 *               - body
 *             properties:
 *               body:
 *                 type: string
 *                 example: Great article! Very helpful.
 *     responses:
 *       201:
 *         description: Комментарий добавлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Статья не найдена
 */
router.post('/articles/:slug/comments', authenticate, validate(createCommentSchema), addComment);

/**
 * @swagger
 * /api/articles/{slug}/comments:
 *   get:
 *     summary: Получить комментарии к статье
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Уникальный slug статьи
 *     responses:
 *       200:
 *         description: Список комментариев
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Статья не найдена
 */
router.get('/articles/:slug/comments', getComments);

/**
 * @swagger
 * /api/articles/{slug}/comments/{id}:
 *   delete:
 *     summary: Удалить комментарий
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Уникальный slug статьи
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID комментария
 *     responses:
 *       200:
 *         description: Комментарий удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comment deleted successfully
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав на удаление этого комментария
 *       404:
 *         description: Статья или комментарий не найдены
 */
router.delete('/articles/:slug/comments/:id', authenticate, deleteComment);

export default router;
