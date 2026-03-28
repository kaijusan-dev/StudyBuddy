import express from 'express'
import * as adminController from '../controllers/admin.controller.js'

const adminRouter = express.Router();

adminRouter.post('/something',  adminController.something);

export default adminRouter;