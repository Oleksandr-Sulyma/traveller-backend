import { Router } from 'express';
import { loginUserSchema, registerUserSchema, requestResetEmailSchema } from '../validations/authValidation.js';
import { celebrate } from 'celebrate';
import { registerUser, loginUser, requestResetEmail } from '../controllers/authController.js';


const router = Router();


router.post("/auth/register", celebrate(registerUserSchema), registerUser);
router.post("/auth/login", celebrate(loginUserSchema), loginUser);
router.post("/auth/request-reset-email", celebrate(requestResetEmailSchema), requestResetEmail);
//...

export default router;
