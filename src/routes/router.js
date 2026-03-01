import { Router } from 'express';
import categoryRoutes from './categoryRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import storyRoutes from './storyRoutes.js';

const router = Router();

router.use('/categories', categoryRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stories', storyRoutes);

export { router };
