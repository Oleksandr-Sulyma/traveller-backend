import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import { uploadAvatar } from '../middleware/multer.js';
import {
  getAllUsers,
  getCurrentUser,
  getUserByIdPublic,
  getUserByIdPrivate,
  updateUserAvatar,
  updateUserInfo,
} from '../controllers/userController.js';
import {
  getAllUsersSchema,
  getUserStoriesSchema,
  updateUserSchema,
} from '../validations/userValidation.js';

const router = Router();

router.get('/', celebrate(getAllUsersSchema), getAllUsers);
router.get('/me', authenticate, getCurrentUser);
router.patch('/me/avatar', authenticate, uploadAvatar.single('avatar'), updateUserAvatar);
router.patch('/me/profile', authenticate, celebrate(updateUserSchema), updateUserInfo);
// ПУБЛІЧНА сторінка користувача
router.get('/:id', celebrate(getUserStoriesSchema), getUserByIdPublic);

// ПРИВАТНА сторінка (додаємо лише цей маршрут)
router.get('/:id/private', authenticate, celebrate(getUserStoriesSchema),getUserByIdPrivate);

export default router;
