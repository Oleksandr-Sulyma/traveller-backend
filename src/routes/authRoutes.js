import { Router } from "express";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validations/authValidation.js";
import { celebrate } from "celebrate";
import { registerUser, loginUser, checkSession } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.post("/auth/register", celebrate(registerUserSchema), registerUser);
router.post("/auth/login", celebrate(loginUserSchema), loginUser);
router.get("/auth/session", authenticate, checkSession);
//...

export default router;

