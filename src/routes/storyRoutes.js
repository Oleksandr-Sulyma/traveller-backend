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
 * description: Керування історіями (префікс /stories)
 */

router.get('/', celebrate(schemas.getAllStoriesSchema), getAllStories);

router.get('/:storyId', celebrate(schemas.getStoryByIdSchema), getStoryById);

// Захищені роути
router.use(authenticate);

router.get('/own', celebrate(schemas.getMyStoriesSchema), getMyStories);

router.get('/saved', celebrate(schemas.getSavedStoriesSchema), getSavedStories);

router.post(
  '/',
  uploadStoryImg.single('img'),
  celebrate(schemas.createStorySchema),
  createStory
);

router.patch(
  '/:storyId',
  uploadStoryImg.single('img'),
  celebrate(schemas.updateStorySchema),
  updateStory
);

router.post('/:storyId/save', addToSave);

router.delete('/:storyId/save', removeFromSave);

export default router;
