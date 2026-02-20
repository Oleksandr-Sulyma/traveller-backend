import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  addToSaved,
  removeFromSaved,
} from "../controllers/userController.js";

const router = Router();

router.post("/saved/:storyId", authenticate, addToSaved);
router.delete("/saved/:storyId", authenticate, removeFromSaved);

export default router;