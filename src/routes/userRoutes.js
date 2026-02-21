import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";

//import {getAllUsers,getCurrentUser,getUserById,updateUserAvatar,updateUserInfo,} from "../controllers/userController.js";
import { celebrate } from "celebrate";

const router = Router();

// 1. ПУБЛІЧНИЙ: Отримання всіх авторів + пагінація
//router.get('/users', getAllUsers);

// 2. ПРИВАТНИЙ: Інформація про поточного користувача
//router.get('/users/me', authenticate, getCurrentUser);

// 3. ПУБЛІЧНИЙ: Отримання даних про користувача за ID + його статті
//router.get('/users/:id', getUserById);

// 4. ПРИВАТНИЙ: Оновлення аватару
// router.patch('/users/me/avatar', authenticate, upload.single('avatar'), updateUserAvatar);

// 5. ПРИВАТНИЙ: Оновлення даних (ім'я, опис тощо)
// router.patch('/users/me/profile', authenticate, celebrate(updateUserSchema), updateUserInfo);

export default router;
