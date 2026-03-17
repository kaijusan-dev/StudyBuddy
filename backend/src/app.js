import express from 'express'
import cors from "cors";
import authRouter from './routes/auth.route.js';
import profileRouter from './routes/profile.route.js';
import scheduleRouter from './routes/schedule.route.js';
import path from 'path';

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/schedule', scheduleRouter); 
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

export default app;