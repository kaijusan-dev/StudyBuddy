import express from 'express'
import cors from "cors";
import scheduleRouter from './routes/schedule.route.js';
import { initializeScheduleTable } from './services/schedule.service.js';

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.get('/', (req, res) => {
    res.json({ message: "Backend work!!!!!!"});
});
    
app.use('/schedule', scheduleRouter);    

async function initialize() {
    try {
        await initializeScheduleTable();
        console.log('Schedule table initialized');
    } catch (err) {
        console.error('Error initializing schedule table:', err);
    }
}
initialize();

const PORT = process.env.PORT || 3000;

app.listen(PORT,() => {
    console.log(`Started server on port ${PORT}`);
});