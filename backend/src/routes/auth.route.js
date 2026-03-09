import express from 'express'
import * as authController from '../controllers/auth.controller.js'
import { loginSchema, registerSchema } from '../schemas/auth.schemas.js';
import { validate } from '../middlewares/validate.js';

const authRouter = express.Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);

export default authRouter;