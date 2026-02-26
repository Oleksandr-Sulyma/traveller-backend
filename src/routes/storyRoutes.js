import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import {
  getMyStories,
  getAllStories,
  getStoryById,
  getSavedStories,
  addToSave,
  removeFromSave,
  createStory,
  updateStory,
} from '../controllers/storyController.js';
import * as schemas from '../validations/storyValidation.js';
import { uploadStoryImg } from '../middleware/multer.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Stories
 *     description: Manage stories (prefix /stories)
 */

// Public routes

/**
 * @swagger
 * /stories:
 *   post:
 *     summary: Create a new story
 *     tags:
 *       - Stories
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - article
 *               - category
 *               - img
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Подорож до Карпат"
 *               article:
 *                 type: string
 *                 example: "Це була неймовірна пригода..."
 *               category:
 *                 type: string
 *                 description: ID категорії (24 chars hex)
 *                 example: "65f1234567890abcdef12345"
 *               img:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Story created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Story'
 */
router.post(
  '/',
  uploadStoryImg.single('img'),
  celebrate(schemas.createStorySchema),
  createStory
);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /stories/own:
 *   get:
 *     summary: Get current user's own stories
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of user's own stories
 *       500:
 *         description: Failed to fetch user's stories
 */
router.get('/own', celebrate(schemas.getMyStoriesSchema), getMyStories);

/**
 * @swagger
 * /stories/saved:
 *   get:
 *     summary: Get current user's saved stories
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of saved stories
 *       500:
 *         description: Failed to fetch saved stories
 */
router.get('/saved', celebrate(schemas.getSavedStoriesSchema), getSavedStories);

/**
 * @swagger
 * /stories:
 *   post:
 *     summary: Create a new story
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, article, category, img]
 *             properties:
 *               title: { type: string }
 *               article: { type: string }
 *               category: { type: string }
 *               img: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Story successfully created
 *       400:
 *         description: Image file is required or invalid category
 *       500:
 *         description: Failed to create story
 */
router.post(
  '/',
  uploadStoryImg.single('img'),
  celebrate(schemas.createStorySchema),
  createStory
);

/**
 * @swagger
 * /stories/{storyId}/save:
 *   post:
 *     summary: Add story to saved
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Story successfully added to saved
 *       404:
 *         description: Story not found
 *       500:
 *         description: Failed to save story
 */
router.post('/:storyId/save', addToSave);

/**
 * @swagger
 * /stories/{storyId}/save:
 *   delete:
 *     summary: Remove story from saved
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Story successfully removed from saved
 *       404:
 *         description: Story not found
 *       500:
 *         description: Failed to remove story from saved
 */
router.delete('/:storyId/save', removeFromSave);

/**
 * @swagger
 * /stories/{storyId}:
 *   get:
 *     summary: Get a story by ID
 *     tags: [Stories]
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Story retrieved successfully
 *       404:
 *         description: Story not found
 *       500:
 *         description: Failed to fetch story
 */
router.get('/:storyId', celebrate(schemas.getStoryByIdSchema), getStoryById);

/**
 * @swagger
 * /stories/{storyId}:
 *   patch:
 *     summary: Update a story
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               article: { type: string }
 *               category: { type: string }
 *               img: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Story successfully updated
 *       400:
 *         description: Invalid category
 *       404:
 *         description: Story not found
 *       500:
 *         description: Failed to update story
 */
router.patch(
  '/:storyId',
  uploadStoryImg.single('img'),
  celebrate(schemas.updateStorySchema),
  updateStory
);

export default router;
