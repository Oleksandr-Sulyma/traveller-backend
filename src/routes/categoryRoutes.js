import { Router } from "express";
import { getAllCategories } from "../controllers/categoryController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Categories
 * description: Керування категоріями історій
 */

/**
 * @swagger
 * /categories:
 * get:
 * summary: Отримання списку всіх категорій
 * tags: [Categories]
 */
router.get("/", getAllCategories);

export default router;
