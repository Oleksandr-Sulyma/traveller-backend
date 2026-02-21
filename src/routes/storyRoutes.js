import { Router } from "express";
import { celebrate } from "celebrate";
import { authenticate } from "../middleware/authenticate.js";
import {
  getMyStories,
  getAllStories,
  getStoryById,
  getSavedStories,
  addToSave,
  removeFromSave,
  createStory,
  updateStory,
} from "../controllers/storyController.js";
import * as schemas from "../validations/storyValidation.js";
import { upload } from "../middleware/multer.js";

const router = Router();

// 1. ПУБЛІЧНИЙ: Отримання всіх історій (пагінація + фільтр)
router.get("/stories", celebrate(schemas.getAllStoriesSchema), getAllStories);

// 3. ПРИВАТНИЙ: Отримання власних історій (OwnStories)
router.get(
  "/stories/own",
  authenticate,
  celebrate(schemas.getMyStoriesSchema),
  getMyStories,
);

// 4. ПРИВАТНИЙ: Отримання збережених історій (SavedStories)
router.get(
  "/stories/saved",
  authenticate,
  celebrate(schemas.getSavedStoriesSchema),
  getSavedStories,
);

// 2. ПУБЛІЧНИЙ: Отримання однієї історії за ID
router.get(
  "/stories/:storyId",
  celebrate(schemas.getStoryByIdSchema),
  getStoryById,
);

// 5. ПРИВАТНИЙ: Створення історії (Приватний + завантаження фото + валідація body)
router.post(
  "/stories",
  authenticate,
  upload.single("img"),
  celebrate(schemas.createStorySchema),
  createStory,
);

// 6. ПРИВАТНИЙ: Редагування історії (Приватний + завантаження фото + валідація params/body)
router.patch(
  "/stories/:storyId",
  authenticate,
  upload.single("img"),
  celebrate(schemas.updateStorySchema),
  updateStory,
);

// 7. ПРИВАТНИЙ: Додавання/Видалення зі збережених
router.post("/stories/:storyId/save", authenticate, addToSave);
router.delete("/stories/:storyId/save", authenticate, removeFromSave);

export default router;
