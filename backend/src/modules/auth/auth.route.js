import express from 'express'
import * as authController from './auth.controller.js'
import { loginSchema, registerSchema } from './auth.schemas.js';
import { validate } from '#app';

export const authRouter = express.Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
