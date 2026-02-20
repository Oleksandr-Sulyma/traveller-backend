import { Router } from "express";
import { celebrate } from "celebrate";
import { authenticate } from "../middleware/authenticate.js";
import { getMyStories } from "../controllers/storyController.js";
import {
  createStorySchema,
  getMyStoriesSchema,
} from "../validations/storyValidation.js";

const router = Router();

// router.get("/stories");
//...
router.get(
  "/myStories",
  authenticate,
  celebrate(getMyStoriesSchema),
  getMyStories,
);

export default router;
