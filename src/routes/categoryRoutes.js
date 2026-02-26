import { Router } from "express";
import { getAllCategories } from "../controllers/categoryController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Керування категоріями історій
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Отримання списку всіх категорій
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Успішне отримання списку категорій
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get("/", getAllCategories);

export default router;
