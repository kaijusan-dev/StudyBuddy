import express from 'express'
import * as adminController from './admin.controller.js'
import {authMiddleware} from "../auth/auth.middleware.js";

export const adminRouter = express.Router();

adminRouter.get('/users', authMiddleware, adminController.getUsers);

adminRouter.delete('/users/:id', authMiddleware, adminController.deleteUser);

adminRouter.post('/toggle-role/:id', authMiddleware, adminController.toggleRole);

adminRouter.post('/schedule', authMiddleware, adminController.addEvent);

adminRouter.delete('/schedule/:id', authMiddleware, adminController.deleteEvent);
