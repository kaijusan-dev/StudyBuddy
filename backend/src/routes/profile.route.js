import express from 'express'
import { validate } from '../middlewares/validate.js';
import { emailSettingsSchema, generalSettingsSchema, passwordSettingsSchema } from '../schemas/profile.schemas.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { findUserById } from '../repositories/auth.repository.js';
import { updateProfileController } from '../controllers/profile.controller.js';

const profileRouter = express.Router();

profileRouter.get('/', authMiddleware, async (req, res) => {
    const user = await findUserById(req.user.id);
    const {password, ...userData} = user;
    res.json(userData);
});

profileRouter.patch('/general', authMiddleware, validate(generalSettingsSchema), updateProfileController);
profileRouter.patch('/email', authMiddleware, validate(emailSettingsSchema), updateProfileController);
profileRouter.patch('/password', authMiddleware, validate(passwordSettingsSchema), updateProfileController);

export default profileRouter;