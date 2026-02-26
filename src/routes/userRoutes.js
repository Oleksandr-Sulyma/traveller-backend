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
 * description: Керування користувачами (префікс /users)
 */

router.get('/', celebrate(getAllUsersSchema), getAllUsers);

router.get('/me', authenticate, getCurrentUser);

router.get('/:id', celebrate(getUserStoriesSchema), getUserById);

router.patch('/me/avatar', authenticate, uploadAvatar.single('avatar'), updateUserAvatar);

router.patch('/me/profile', authenticate, celebrate(updateUserSchema), updateUserInfo);

export default router;
