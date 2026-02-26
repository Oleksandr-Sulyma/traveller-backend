// categoryRouter.js
import { Router } from "express";
import { getAllCategories } from "../controllers/categoryController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Manage story categories
 */

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
 *           description: Unique category ID
 *         name:
 *           type: string
 *           example: "Travel"
 *           description: Category name
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     description: Returns a list of all story categories.
 *     responses:
 *       200:
 *         description: Successfully fetched categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *             example:
 *               - _id: "65fb50c80ae91338641121f0"
 *                 name: "Travel"
 *               - _id: "65fb50c80ae91338641121f1"
 *                 name: "Science"
 *               - _id: "65fb50c80ae91338641121f2"
 *                 name: "Lifestyle"
 *       500:
 *         description: Failed to fetch categories
 */
router.get("/", getAllCategories);

export default router;
