import express from 'express'
import cors from "cors";
import scheduleRouter from './routes/schedule.route.js';
import { fetchAndSaveSchedule } from './services/schedule.service.js';
import { initializeScheduleTable, initializeUsersTable, connectWithRetry } from './db.js';
import authRouter from './routes/auth.route.js';
import authMiddleware from './middlewares/auth.middleware.js';
import { findUserById } from './repositories/auth.repository.js';

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.get('/', (req, res) => {
    res.json({ message: "Backend work!!!!!!"});
});
  
app.use('/auth', authRouter);

app.get('/profile', authMiddleware, async (req, res) => {
    const user = await findUserById(req.user.id);
    const {password, ...userData} = user;
    res.json(userData);
});

async function startServer() {
    try {
        await connectWithRetry();
        await initializeScheduleTable();
        await initializeUsersTable();

        const calendarUrl = 'https://ical.psu.ru/calendars/R5CGGG87TW36X3D6';
        await fetchAndSaveSchedule(calendarUrl);

        console.log('Initial schedule fetch and save completed');

        app.use('/schedule', scheduleRouter);   

    } catch (err) {
        console.error('Error starting server:', err);
    }
}
startServer();

const PORT = process.env.PORT || 3000;

app.listen(PORT,() => {
    console.log(`Started server on port ${PORT}`);
});