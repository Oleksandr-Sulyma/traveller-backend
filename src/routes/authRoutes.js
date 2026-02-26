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
 *     description: User authentication and session management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new account and automatically sets session cookies.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             example:
 *               _id: "64f0c8a1e3b1a123456789ab"
 *               name: "John Doe"
 *               email: "john@example.com"
 *               avatarUrl: "https://example.com/avatar.jpg"
 *       409:
 *         description: Email already in use
 *       400:
 *         description: Validation error (invalid email/password)
 *       500:
 *         description: Internal server error
 */
router.post("/register", celebrate(registerUserSchema), registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in to the system
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             example:
 *               _id: "64f0c8a1e3b1a123456789ab"
 *               name: "John Doe"
 *               email: "john@example.com"
 *               avatarUrl: "https://example.com/avatar.jpg"
 *               accessToken: "jwtAccessTokenHere"
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post("/login", celebrate(loginUserSchema), loginUser);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh user session
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Session refreshed successfully
 *         content:
 *           application/json:
 *             example:
 *               accessToken: "newJwtAccessTokenHere"
 *       401:
 *         description: Unauthorized / Refresh token invalid
 *       500:
 *         description: Internal server error
 */
router.post("/refresh", refreshUserSession);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: Successfully logged out
 *       401:
 *         description: No active session
 *       500:
 *         description: Internal server error
 */
router.post("/logout", authenticate, logoutUser);

/**
 * @swagger
 * /auth/check:
 *   get:
 *     summary: Check current user session
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Session is valid
 *         content:
 *           application/json:
 *             example:
 *               _id: "64f0c8a1e3b1a123456789ab"
 *               name: "John Doe"
 *               email: "john@example.com"
 *               avatarUrl: "https://example.com/avatar.jpg"
 *       401:
 *         description: No active session / Invalid session / Session expired
 *       500:
 *         description: Internal server error
 */
router.get("/check", authenticate, checkSession);

/**
 * @swagger
 * /auth/request-reset-email:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Password reset email sent"
 *       400:
 *         description: Validation error
 *       500:
 *         description: Failed to send the email
 */
router.post("/request-reset-email", celebrate(requestResetEmailSchema), requestResetEmail);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: "resetTokenFromEmail"
 *               password:
 *                 type: string
 *                 example: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Password has been reset"
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         description: User not found
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post("/reset-password", celebrate(resetPasswordSchema), resetPassword);

export default router;
