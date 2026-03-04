import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import { uploadStoryImg } from '../middleware/multer.js';
import {
  getAllStories,
  getStoryById,
  getOwnStories,
  getSavedStories,
  addToSave,
  removeFromSave,
  createStory,
  updateStory,
  deleteStory,
} from '../controllers/storyController.js';

import {
  getAllStoriesSchema,
  createStorySchema,
  updateStorySchema,
  getStoryByIdSchema,
} from '../validations/storyValidation.js';

const router = Router();

router.get('/', celebrate(getAllStoriesSchema), getAllStories);

router.get('/own', authenticate, getOwnStories);
router.get('/saved', authenticate, getSavedStories);

router.get('/:id', celebrate(getStoryByIdSchema), getStoryById);

router.post(
  '/',
  authenticate,
  uploadStoryImg.single('img'),
  celebrate(createStorySchema),
  createStory,
);

router.patch(
  '/:id',
  authenticate,
  uploadStoryImg.single('img'),
  celebrate(updateStorySchema),
  updateStory,
);

router.delete('/:id', authenticate, celebrate(getStoryByIdSchema), deleteStory);

router.post(
  '/:id/save',
  authenticate,
  celebrate(getStoryByIdSchema),
  addToSave,
);
router.delete(
  '/:id/save',
  authenticate,
  celebrate(getStoryByIdSchema),
  removeFromSave,
);

export default router;
