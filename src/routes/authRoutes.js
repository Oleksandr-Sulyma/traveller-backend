import { Router } from 'express';
import { loginUserSchema, registerUserSchema } from '../validations/authValidation.js';


const router = Router();


router.post("/auth/register", celebrate(registerUserSchema), registerUser);
router.post("/auth/login", celebrate(loginUserSchema), loginUser);
//...

export default router;