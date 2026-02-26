import { Router } from "express";
import { celebrate } from "celebrate";
import {
  loginUserSchema,
  registerUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema
} from "../validations/authValidation.js";
import {
  registerUser,
  loginUser,
  refreshUserSession,
  requestResetEmail,
  logoutUser,
  resetPassword,
  checkSession,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 * description: Керування авторизацією та сесіями
 */

/**
 * @swagger
 * /auth/register:
 * post:
 * summary: Реєстрація нового користувача
 * tags: [Auth]
 */
router.post("/register", celebrate(registerUserSchema), registerUser);

/**
 * @swagger
 * /auth/login:
 * post:
 * summary: Вхід у систему
 * tags: [Auth]
 */
router.post("/login", celebrate(loginUserSchema), loginUser);

router.post("/refresh", refreshUserSession);

router.post("/logout", authenticate, logoutUser);

router.get("/check", authenticate, checkSession);

router.post("/request-reset-email", celebrate(requestResetEmailSchema), requestResetEmail);

router.post("/reset-password", celebrate(resetPasswordSchema), resetPassword);

export default router;
