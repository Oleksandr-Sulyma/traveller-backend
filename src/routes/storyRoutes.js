import { Router } from "express";
import { celebrate } from "celebrate";
import { authenticate } from "../middleware/authenticate.js";
import {
  getAllStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  getOwnStories,
  getSavedStories,
  addToSave,
  removeFromSave,
} from "../controllers/storyController.js";

import { uploadStoryImg } from "../middleware/multer.js";
import {
  getAllStoriesSchema,
  getStoryByIdSchema,
  createStorySchema,
  updateStorySchema,
  getMyStoriesSchema,
} from "../validations/storyValidation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Stories
 *     description: CRUD та фільтрація історій
 */

// --- ПУБЛІЧНІ ТА ФІЛЬТРОВАНІ РОУТИ ---

/**
 * @swagger
 * /stories:
 *   get:
 *     summary: Отримати список історій (з пагінацією та фільтрами)
 *     tags: [Stories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *       - in: query
 *         name: favorite
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
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
 *         description: Успішно отримано список
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedStories'
 */
router.get("/", authenticate, celebrate(getAllStoriesSchema), getAllStories);

/**
 * @swagger
 * /stories/own:
 *   get:
 *     summary: Отримати власні історії користувача
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedStories'
 */
router.get("/own", authenticate, celebrate(getMyStoriesSchema), getOwnStories);

/**
 * @swagger
 * /stories/saved:
 *   get:
 *     summary: Отримати список збережених історій користувача
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedStories'
 */
router.get("/saved", authenticate, celebrate(getMyStoriesSchema), getSavedStories);

/**
 * @swagger
 * /stories/{id}:
 *   get:
 *     summary: Деталі однієї історії
 *     tags: [Stories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Story'
 */
router.get("/:id", celebrate(getStoryByIdSchema), getStoryById);

// --- РОУТИ ДЛЯ КЕРУВАННЯ ---

router.post(
  "/",
  authenticate,
  uploadStoryImg.single("img"),
  celebrate(createStorySchema),
  createStory
);

router.patch(
  "/:id",
  authenticate,
  uploadStoryImg.single("img"),
  celebrate(updateStorySchema),
  updateStory
);

router.delete("/:id", authenticate, celebrate(getStoryByIdSchema), deleteStory);

// --- РОУТИ ДЛЯ "ОБРАНОГО" ---

/**
 * @swagger
 * /stories/{id}/save:
 *   post:
 *     summary: Додати історію до збережених
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Список ID збережених історій
 */
router.post("/:id/save", authenticate, addToSave);

/**
 * @swagger
 * /stories/{id}/save:
 *   delete:
 *     summary: Видалити історію зі збережених
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Оновлений список ID
 */
router.delete("/:id/save", authenticate, removeFromSave);

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
