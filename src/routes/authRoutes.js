import { Router } from "express";
import { celebrate } from "celebrate";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  loginUserSchema,
  registerUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from "../validations/authValidation.js";
import {
  registerUser,
  loginUser,
  refreshUserSession,
  requestResetEmail,
  logoutUser,
  resetPassword,
  checkSession,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Керування автентифікацією та сесіями користувачів
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Реєстрація нового користувача
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: Успішно зареєстровано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email уже використовується
 */
router.post("/register", authLimiter, celebrate(registerUserSchema), registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Вхід у систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: Успішний вхід. Встановлюються куки accessToken та refreshToken.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Невірні облікові дані
 */
router.post("/login", authLimiter, celebrate(loginUserSchema), loginUser);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Оновлення сесії
 *     description: Використовує refreshToken з кук для видачі нової пари токенів.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Сесію оновлено
 *       401:
 *         description: Refresh токен недійсний
 */
router.post("/refresh", refreshUserSession);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Вихід із системи
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: Куки очищено
 */
router.post("/logout", authenticate, logoutUser);

/**
 * @swagger
 * /auth/check:
 *   get:
 *     summary: Перевірка поточного стану сесії
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Сесія активна
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/check", authenticate, checkSession);

/**
 * @swagger
 * /auth/request-reset-email:
 *   post:
 *     summary: Запит на скидання пароля
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Лист надіслано
 */
router.post(
  "/request-reset-email",
  authLimiter,
  celebrate(requestResetEmailSchema),
  requestResetEmail
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Встановлення нового пароля
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: "secret-token"
 *               password:
 *                 type: string
 *                 example: "newSecurePass123"
 *     responses:
 *       200:
 *         description: Пароль змінено
 */
router.post("/reset-password", celebrate(resetPasswordSchema), resetPassword);

export default router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f0c8a1e3b1a123456789ab"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           example: "john@example.com"
 *         avatarUrl:
 *           type: string
 *           example: "https://example.com/avatar.jpg"
 *
 *     RegisterUser:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 32
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *
 *     LoginUser:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *
 *   responses:
 *     ValidationError:
 *       description: Помилка валідації
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 example: 400
 *               message:
 *                 type: string
 *                 example: "Validation failed"
 */
