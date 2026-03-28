import express from 'express'
import cors from "cors";
import authRouter from './routes/auth.route.js';
import profileRouter from './routes/profile.route.js';
import scheduleRouter from './routes/schedule.route.js';
import authMiddleware from './middlewares/auth.middleware.js';
import adminMiddleware from './middlewares/admin.middleware.js';
import adminRouter from './routes/admin.route.js';
import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use('/api/auth', authRouter);
app.use('/api/profile', authMiddleware, profileRouter);
app.use('/api/schedule', authMiddleware, scheduleRouter); 
app.use('/api/admin', authMiddleware, adminMiddleware, adminRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPath = path.join(__dirname, '../uploads');

// отдача файлов
app.use('/api/uploads', express.static(uploadPath));

export default app;