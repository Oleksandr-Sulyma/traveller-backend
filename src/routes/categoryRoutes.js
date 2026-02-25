import { Router } from 'express';
import { getAllCategories } from '../controllers/categoryController.js';

const router = Router();

router.get('/categories', getAllCategories);

export default router;
