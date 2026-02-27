import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import { uploadAvatar } from '../middleware/multer.js';
import {
  getAllUsers,
  getCurrentUser,
  getUserById,
  updateUserAvatar,
  updateUserInfo,
} from '../controllers/userController.js';
import {
  getAllUsersSchema,
  getUserStoriesSchema,
  updateUserSchema,
} from '../validations/userValidation.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Manage users (prefix /users)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (paginated)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, createdAt]
 *           default: createdAt
 *         description: Field to sort users by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sorting direction
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of users with pagination
 *         content:
 *           application/json:
 *             example:
 *               page: 1
 *               perPage: 10
 *               total: 42
 *               totalPages: 5
 *               users:
 *                 - _id: "64f0c8a1e3b1a123456789ab"
 *                   name: "John Doe"
 *                   email: "john@example.com"
 *                   avatarUrl: "https://example.com/avatar.jpg"
 *       500:
 *         description: Server error
 */
router.get('/', celebrate(getAllUsersSchema), getAllUsers);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *         content:
 *           application/json:
 *             example:
 *               _id: "64f0c8a1e3b1a123456789cd"
 *               name: "John Doe"
 *               email: "john@example.com"
 *               avatarUrl: "https://example.com/avatar.jpg"
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @swagger
 * /users/me/avatar:
 *   patch:
 *     summary: Update current user's avatar
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file (jpg, png, webp), max 500KB
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatarUrl:
 *                   type: string
 *                   example: "https://res.cloudinary.com/..."
 *       400:
 *         description: Bad request (no file or invalid format)
 */
router.patch('/me/avatar', authenticate, uploadAvatar.single('avatar'), updateUserAvatar);

/**
 * @swagger
 * /users/me/profile:
 *   patch:
 *     summary: Update current user's profile info
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch('/me/profile', authenticate, celebrate(updateUserSchema), updateUserInfo);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID with their stories
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f0c8a1e3b1a123456789ab"
 *         description: Unique user ID (MongoDB ObjectId)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for user's stories
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of stories per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title]
 *           default: createdAt
 *         description: Field to sort stories by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sorting direction for stories
 *     responses:
 *       200:
 *         description: User info with their stories
 *         content:
 *           application/json:
 *             example:
 *               _id: "64f0c8a1e3b1a123456789ab"
 *               name: "John Doe"
 *               email: "john@example.com"
 *               avatarUrl: "https://example.com/avatar.jpg"
 *               stories:
 *                 - _id: "64f0c8a1e3b1a123456789cd"
 *                   title: "My First Story"
 *                   category:
 *                     _id: "65fb50c80ae91338641121f0"
 *                     name: "Travel"
 *                   formattedDate: "27.02.2026"
 *                   favoriteCount: 3
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', celebrate(getUserStoriesSchema), getUserById);

export default router;
