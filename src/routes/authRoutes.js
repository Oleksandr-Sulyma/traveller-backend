import { Router } from 'express';
import { loginUserSchema, registerUserSchema } from '../validations/authValidation.js';
import { celebrate } from 'celebrate';
import { registerUser, loginUser } from '../controllers/authController.js';


const router = Router();


router.post("/auth/register", celebrate(registerUserSchema), registerUser);
router.post("/auth/login", celebrate(loginUserSchema), loginUser);
router.post("/auth/refresh", loginUser);

export default router;
