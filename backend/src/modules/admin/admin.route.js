import express from 'express'
import * as adminController from './admin.controller.js'

export const adminRouter = express.Router();

adminRouter.get('/users', adminController.getUsers);

adminRouter.delete('/users/:id', adminController.deleteUser);

adminRouter.post('/toggle-role/:id', adminController.toggleRole);

adminRouter.post('/schedule', adminController.addEvent);

adminRouter.delete('/schedule/:id', adminController.deleteEvent);
