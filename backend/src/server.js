import app from "./app.js";
import http from 'http'
import { createPetSocket } from "./ws/pet.socket.js";
import { connectWithRetry, initializePetsTable, initializeScheduleTable, initializeUsersTable } from "./db.js";
import {fetchAndSaveSchedule} from './services/schedule.service.js'

const server = http.createServer(app);

createPetSocket(server);

async function startServer() {
    try {
        await connectWithRetry();
        await initializeScheduleTable();
        await initializeUsersTable();
        await initializePetsTable();

        const calendarUrl = 'https://ical.psu.ru/calendars/R5CGGG87TW36X3D6';
        await fetchAndSaveSchedule(calendarUrl);

        console.log('Initial schedule fetch and save completed');

    } catch (err) {
        console.error('Error starting server:', err);
    }
}
startServer();

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0',() => {
    console.log(`Started server on port ${PORT}`);
});