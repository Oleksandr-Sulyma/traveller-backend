import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  requestResetEmail,
  resetPassword,
  checkSession,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  celebrate(registerUserSchema),
  registerUser,
);
router.post('/login', authLimiter, celebrate(loginUserSchema), loginUser);
router.post('/refresh', refreshUserSession);
router.post('/logout', authenticate, logoutUser);
router.get('/check', authenticate, checkSession);
router.post(
  '/request-reset-email',
  authLimiter,
  celebrate(requestResetEmailSchema),
  requestResetEmail,
);
router.post('/reset-password', celebrate(resetPasswordSchema), resetPassword);

export default router;
