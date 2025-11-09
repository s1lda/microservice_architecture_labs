import { Router } from 'express';
import { registerUser, loginUser, getCurrentUser, updateUser } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerUserSchema, loginUserSchema, updateUserSchema } from '../utils/validation';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               bio:
 *                 type: string
 *                 example: Software developer
 *               image_url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации или пользователь уже существует
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/users', validate(registerUserSchema), registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Аутентификация пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Успешная аутентификация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Неверные учетные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/users/login', validate(loginUserSchema), loginUser);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Получить данные текущего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/user', authenticate, getCurrentUser);

/**
 * @swagger
 * /api/user:
 *   put:
 *     summary: Обновить данные текущего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newemail@example.com
 *               username:
 *                 type: string
 *                 example: newusername
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: newpassword123
 *               bio:
 *                 type: string
 *                 example: Updated bio
 *               image_url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/new-avatar.jpg
 *     responses:
 *       200:
 *         description: Данные пользователя обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/user', authenticate, validate(updateUserSchema), updateUser);

export default router;
