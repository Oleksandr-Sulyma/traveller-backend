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
 *     summary: Отримати всі категорії
 *     tags: [Categories]
 *     description: Повертає повний список доступних категорій для історій.
 *     responses:
 *       200:
 *         description: Список категорій успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Помилка сервера при отриманні категорій
 */
router.get("/", getAllCategories);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - _id
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           example: "65fb50c80ae91338641121f0"
 *           description: Унікальний ID категорії
 *         name:
 *           type: string
 *           example: "Travel"
 *           description: Назва категорії
 */
