import express from 'express'
import cors from "cors";
import scheduleRouter from './routes/schedule.route.js';
import { fetchAndSaveSchedule } from './services/schedule.service.js';
import { saveUserToDB } from './services/auth.service.js';
import { initializeScheduleTable, initializeUsersTable } from './db.js';

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.get('/', (req, res) => {
    res.json({ message: "Backend work!!!!!!"});
});
  
app.post('/auth', async (req, res) => {
    try {
        await saveUserToDB(req).then(console.log('User saved'));
        res.json({message: "Auth working!"});
    }
    catch(err) {
        console.log(err);
    }
})

async function startServer() {
    try {
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