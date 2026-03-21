import express from 'express'
import cors from "cors";
import authRouter from './routes/auth.route.js';
import profileRouter from './routes/profile.route.js';
import scheduleRouter from './routes/schedule.route.js';

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/schedule', scheduleRouter); 

export default app;