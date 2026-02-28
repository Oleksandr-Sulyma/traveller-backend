import { Router } from "express";
import { celebrate } from "celebrate";
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
import {
  getAllStoriesSchema,
  getStoryByIdSchema,
  createStorySchema,
  updateStorySchema,
  getMyStoriesSchema,
} from '../validations/storyValidation.js';

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
router.get('/', celebrate(getAllStoriesSchema), getAllStories);

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
router.get('/own', authenticate, celebrate(getMyStoriesSchema), getOwnStories);

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
router.get('/saved', authenticate, celebrate(getMyStoriesSchema), getSavedStories);

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
router.post('/', authenticate, uploadStoryImg.single('img'), celebrate(createStorySchema), createStory);

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
router.get('/:id', celebrate(getStoryByIdSchema), getStoryById);

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
router.patch('/:id', authenticate, uploadStoryImg.single('img'), celebrate(updateStorySchema), updateStory);

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
router.delete('/:id', authenticate, celebrate(getStoryByIdSchema), deleteStory);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Story:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65fb50c80ae91338641121f5"
 *         title:
 *           type: string
 *           example: "Подорож до Карпат"
 *         article:
 *           type: string
 *           maxLength: 2500
 *         img:
 *           type: string
 *           format: uri
 *         category:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *         ownerId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             avatarUrl:
 *               type: string
 *         favoriteCount:
 *           type: integer
 *           default: 0
 *         formattedDate:
 *           type: string
 *           example: "27.02.2026"
 *
 *     CreateStory:
 *       type: object
 *       required:
 *         - title
 *         - article
 *         - img
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 80
 *         article:
 *           type: string
 *           minLength: 10
 *           maxLength: 2500
 *         img:
 *           type: string
 *           format: binary
 *         category:
 *           type: string
 *           description: ID категорії
 *
 *     UpdateStory:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 80
 *         article:
 *           type: string
 *           minLength: 10
 *           maxLength: 2500
 *         img:
 *           type: string
 *           format: binary
 *         category:
 *           type: string
 *
 *     PaginatedStories:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         perPage:
 *           type: integer
 *           example: 10
 *         total:
 *           type: integer
 *           example: 42
 *         totalPages:
 *           type: integer
 *           example: 5
 *         stories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Story'
 */
