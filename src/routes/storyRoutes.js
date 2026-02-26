// storyRouter.js
import { Router } from "express";
import { celebrate } from "celebrate";
import { authenticate } from "../middleware/authenticate.js";
import { uploadStoryImg } from "../middleware/multer.js";
import * as schemas from "../validations/storyValidation.js";
import {
  getAllStories,
  getStoryById,
  getMyStories,
  getSavedStories,
  createStory,
  updateStory,
  addToSave,
  removeFromSave,
} from "../controllers/storyController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Stories
 *     description: Manage stories and user interactions
 */

/**
 * @swagger
 * /stories:
 *   get:
 *     summary: Get all stories with optional filters
 *     tags: [Stories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number for pagination
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 10 }
 *         description: Number of stories per page
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Filter stories by category ID (MongoDB ObjectId)
 *       - in: query
 *         name: author
 *         schema: { type: string }
 *         description: Filter stories by author ID (MongoDB ObjectId)
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, title], default: createdAt }
 *         description: Field to sort stories
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: List of stories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page: { type: integer }
 *                 perPage: { type: integer }
 *                 total: { type: integer }
 *                 totalPages: { type: integer }
 *                 stories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Story'
 *             example:
 *               page: 1
 *               perPage: 10
 *               total: 42
 *               totalPages: 5
 *               stories:
 *                 - _id: "64f0c8a1e3b1a123456789ab"
 *                   title: "Journey to the Carpathians"
 *                   article: "It was an amazing adventure on Hoverla..."
 *                   img: "https://example.com/img/story1.jpg"
 *                   category:
 *                     _id: "65fb50c80ae91338641121f0"
 *                     name: "Travel"
 *                   ownerId:
 *                     _id: "64f0c8a1e3b1a123456789cd"
 *                     name: "John Doe"
 *                     avatarUrl: "https://example.com/img/avatar.jpg"
 *                   formattedDate: "27.02.2026"
 *                   favoriteCount: 15
 */
router.get("/", celebrate(schemas.getAllStoriesSchema), getAllStories);

/**
 * @swagger
 * /stories/{storyId}:
 *   get:
 *     summary: Get story details by ID
 *     tags: [Stories]
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema: { type: string }
 *         description: Story unique ID
 *     responses:
 *       200:
 *         description: Story data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Story'
 *             example:
 *               _id: "64f0c8a1e3b1a123456789ab"
 *               title: "Journey to the Carpathians"
 *               article: "It was an amazing adventure on Hoverla..."
 *               img: "https://example.com/img/story1.jpg"
 *               category:
 *                 _id: "65fb50c80ae91338641121f0"
 *                 name: "Travel"
 *               ownerId:
 *                 _id: "64f0c8a1e3b1a123456789cd"
 *                 name: "John Doe"
 *                 avatarUrl: "https://example.com/img/avatar.jpg"
 *               formattedDate: "27.02.2026"
 *               favoriteCount: 15
 *       404:
 *         description: Story not found
 */
router.get("/:storyId", celebrate(schemas.getStoryByIdSchema), getStoryById);

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
 *         description: Page number
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 10 }
 *         description: Number of stories per page
 *     responses:
 *       200:
 *         description: Successfully fetched own stories
 */
router.get("/own", authenticate, celebrate(schemas.getMyStoriesSchema), getMyStories);

/**
 * @swagger
 * /stories/saved:
 *   get:
 *     summary: Get stories saved by the current user
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
 *         description: Successfully fetched saved stories
 */
router.get("/saved", authenticate, celebrate(schemas.getSavedStoriesSchema), getSavedStories);

/**
 * @swagger
 * /stories:
 *   post:
 *     summary: Create a new story
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, article, category, img]
 *             properties:
 *               title: { type: string, example: "Journey to the Carpathians" }
 *               article: { type: string, example: "It was an amazing adventure..." }
 *               category: { type: string, description: "Category ID", example: "65fb50c80ae91338641121f0" }
 *               img: { type: string, format: binary, description: "Cover image (max 2MB)" }
 *     responses:
 *       201: { description: Story created successfully }
 *       400: { description: Validation error or invalid category }
 *       401: { description: Unauthorized }
 *       500: { description: Failed to create story }
 */
router.post("/", authenticate, uploadStoryImg.single("img"), celebrate(schemas.createStorySchema), createStory);

/**
 * @swagger
 * /stories/{storyId}:
 *   patch:
 *     summary: Update an existing story
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
 *       200: { description: Story updated successfully }
 *       400: { description: Invalid category }
 *       403: { description: No permission to edit this story }
 *       404: { description: Story not found }
 *       500: { description: Failed to update story }
 */
router.patch("/:storyId", authenticate, uploadStoryImg.single("img"), celebrate(schemas.updateStorySchema), updateStory);

/**
 * @swagger
 * /stories/{storyId}/save:
 *   post:
 *     summary: Add a story to saved list
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Story added to saved }
 *       404: { description: Story not found }
 */
router.post("/:storyId/save", authenticate, addToSave);

/**
 * @swagger
 * /stories/{storyId}/save:
 *   delete:
 *     summary: Remove a story from saved list
 *     tags: [Stories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Story removed from saved }
 *       404: { description: User not found }
 */
router.delete("/:storyId/save", authenticate, removeFromSave);

export default router;
