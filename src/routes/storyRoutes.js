import { Router } from "express";
import { celebrate } from "celebrate";
import { authenticate } from "../middleware/authenticate.js";
import { getMyStories, getAllStories } from "../controllers/storyController.js";
import {
  createStorySchema,
  getMyStoriesSchema,
  getAllStoriesSchema,
} from "../validations/storyValidation.js";

const router = Router();

// 1. ПУБЛІЧНИЙ: Отримання всіх історій (пагінація + фільтр)
router.get("/", celebrate(getAllStoriesSchema), getAllStories);

// 2. ПРИВАТНИЙ: Отримання власних історій (OwnStories)
router.get("/own", authenticate, celebrate(getMyStoriesSchema), getMyStories);

// 3. ПРИВАТНИЙ: Отримання збережених історій (SavedStories)
// router.get('/saved', authenticate, celebrate(schemas.getSavedStoriesSchema), getSavedStories);

// 4. ПУБЛІЧНИЙ: Отримання однієї історії за ID
// router.get('/:storyId', getStoryById);

// 5. ПРИВАТНИЙ: Створення історії (Приватний + завантаження фото + валідація body)
// router.post('/', authenticate, upload.single('img'), celebrate(schemas.createStorySchema), createStory);

// 6. ПРИВАТНИЙ: Редагування історії (Приватний + завантаження фото + валідація params/body)
// router.patch('/:storyId', authenticate, upload.single('img'), celebrate(schemas.updateStorySchema), updateStory);

// 7. ПРИВАТНИЙ: Додавання/Видалення зі збережених
// router.post('/:storyId/favorite', authenticate, addToFavorite);
// router.delete('/:storyId/favorite', authenticate, removeFromFavorite);

export default router;
