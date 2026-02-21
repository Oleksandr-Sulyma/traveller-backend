import { Router } from "express";
import { celebrate } from "celebrate";
import {
  loginUserSchema,
  registerUserSchema,
  requestResetEmailSchema,
} from "../validations/authValidation.js";
import {
  registerUser,
  loginUser,
  refreshUserSession,
  requestResetEmail,
  logoutUser,
  checkSession,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";
import { checkSession } from "../controllers/authController.js";

const router = Router();

router.post("/auth/register", celebrate(registerUserSchema), registerUser);
router.post("/auth/login", celebrate(loginUserSchema), loginUser);
router.post("/auth/refresh", refreshUserSession);
router.post(
  "/auth/request-reset-email",
  celebrate(requestResetEmailSchema),
  requestResetEmail,
);
router.post("/auth/logout", authenticate, logoutUser);

// Потрібно буде додати пізніше:
// router.post("/auth/reset-password", celebrate(resetPasswordSchema), resetPassword);

router.get("/auth/check", checkSession);

export default router;
