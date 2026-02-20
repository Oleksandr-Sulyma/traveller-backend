import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  addToSaved,
  removeFromSaved,
  getSavedStories,
} from "../controllers/userController.js";
// import { celebrate } from "celebrate";

const router = Router();

router.post("/saved/:storyId", authenticate, addToSaved);
router.delete("/saved/:storyId", authenticate, removeFromSaved);
router.get("/saved", authenticate, getSavedStories);

export default router;
