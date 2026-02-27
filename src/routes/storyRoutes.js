import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getAllStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  getOwnStories,
  getSavedStories,
} from '../controllers/storyController.js';

import { uploadStoryImg } from '../middleware/multer.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Stories
 *     description: CRUD та фільтрація історій
 */

/**
 * @swagger
 * /stories:
 *   get:
 *     summary: Отримати список історій з прикладами фільтрації
 *     description: |
 *       Цей ендпоінт дозволяє гнучко фільтрувати історії.
 *       **Приклади запитів:**
 *       * `?category=65fb50c8...` — фільтр за категорією.
 *       * `?sortBy=favoriteCount&sortOrder=desc` — найпопулярніші історії зверху.
 *       * `?author=65fb50c8...` — всі історії конкретного автора.
 *       * `?favorite=true` — отримати збережені історії (потребує авторизації).
 *     tags: [Stories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Номер сторінки
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 10 }
 *         description: Кількість елементів
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         example: "65fb50c80ae91338641121f0"
 *         description: MongoDB ID категорії
 *       - in: query
 *         name: author
 *         schema: { type: string }
 *         example: "65fb50c80ae91338641121e5"
 *         description: MongoDB ID автора (ownerId)
 *       - in: query
 *         name: favorite
 *         schema: { type: string, enum: ["true", "false"] }
 *         description: Якщо true, повертає тільки збережені історії юзера
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, favoriteCount]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Успішно отримати список історій
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedStories'
 *             examples:
 *               SuccessResponse:
 *                 summary: Приклад відповіді (stories з populate)
 *                 value:
 *                   page: 1
 *                   perPage: 10
 *                   total: 1
 *                   totalPages: 1
 *                   stories:
 *                     - _id: "65fb50c80ae91338641121f5"
 *                       title: "Подорож до Карпат"
 *                       article: "Це була неймовірна пригода..."
 *                       img: "https://res.cloudinary.com/..."
 *                       category: { _id: "65fb50c8...", name: "Гори" }
 *                       ownerId: { _id: "65fb...", name: "Олександр", avatarUrl: "..." }
 *                       favoriteCount: 12
 *                       formattedDate: "27.02.2026"
 */
router.get('/', getAllStories);

/**
 * @swagger
 * /stories/own:
 *   get:
 *     summary: Отримати власні історії
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Список власних історій
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedStories'
 */
router.get('/own', authenticate, getOwnStories);

/**
 * @swagger
 * /stories/saved:
 *   get:
 *     summary: Отримати збережені історії
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Список збережених історій
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedStories'
 */
router.get('/saved', authenticate, getSavedStories);

/**
 * @swagger
 * /stories:
 *   post:
 *     summary: Створити історію
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateStory'
 *     responses:
 *       201:
 *         description: Історія створена
 */
router.post('/', authenticate, uploadStoryImg.single('img'), createStory);

/**
 * @swagger
 * /stories/{id}:
 *   get:
 *     summary: Отримати історію по ID
 *     tags: [Stories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Деталі історії
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Story'
 */
router.get('/:id', getStoryById);

/**
 * @swagger
 * /stories/{id}:
 *   patch:
 *     summary: Оновити історію
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStory'
 *     responses:
 *       200:
 *         description: Оновлено
 */
router.patch('/:id', authenticate, uploadStoryImg.single('img'), updateStory);

/**
 * @swagger
 * /stories/{id}:
 *   delete:
 *     summary: Видалити історію
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Видалено
 */
router.delete('/:id', authenticate, deleteStory);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Story:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         title: { type: string }
 *         article: { type: string }
 *         img: { type: string }
 *         category:
 *           type: object
 *           properties:
 *             _id: { type: string }
 *             name: { type: string }
 *         ownerId:
 *           type: object
 *           properties:
 *             _id: { type: string }
 *             name: { type: string }
 *             avatarUrl: { type: string }
 *         favoriteCount: { type: integer }
 *         formattedDate: { type: string, example: "27.02.2026" }
 *     CreateStory:
 *       type: object
 *       required: [title, article, img, category]
 *       properties:
 *         title: { type: string }
 *         article: { type: string }
 *         img: { type: string, format: binary }
 *         category: { type: string, description: "ID категорії" }
 *     UpdateStory:
 *       type: object
 *       properties:
 *         title: { type: string }
 *         article: { type: string }
 *         img: { type: string, format: binary }
 *         category: { type: string }
 *     PaginatedStories:
 *       type: object
 *       properties:
 *         stories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Story'
 *         page: { type: integer }
 *         perPage: { type: integer }
 *         total: { type: integer }
 *         totalPages: { type: integer }
 */
