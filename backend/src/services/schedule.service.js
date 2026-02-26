import ical from 'node-ical';
import pool from '../db.js';

async function fetchSchedule(calendarUrl) {
  const res = await fetch(calendarUrl);
  const text = await res.text();

  const events = ical.parseICS(text);
  const schedule = [];
  for (const key in events) {
    const event = events[key];
    if (event.type === "VEVENT") {
        schedule.push({
          uid: event.uid,
          start: event.start,
          end: event.end,
          summary: event.summary,
        });
    }
  }
  console.log('Fetched schedule:', schedule);
  return schedule;
}

async function saveScheduleToDB(schedule) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const event of schedule) {
            await client.query(
                `INSERT INTO schedule (uid, start_time, end_time, summary, group_id) 
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (uid) DO UPDATE
                 SET start_time = EXCLUDED.start_time,
                     end_time = EXCLUDED.end_time,
                     summary = EXCLUDED.summary,
                     group_id = EXCLUDED.group_id;`,
                [event.uid, event.start, event.end, event.summary, 17]
            );
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        console.log('Schedule saved to DB');
        client.release();
    }
}

function fetchAndSaveSchedule(calendarUrl) {
    return fetchSchedule(calendarUrl)
        .then(schedule => saveScheduleToDB(schedule))
        .catch(err => console.error('Error fetching or saving schedule:', err));
}

async function initializeScheduleTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS schedule (
            id SERIAL PRIMARY KEY,
            uid TEXT UNIQUE,
            start_time TIMESTAMPTZ,
            end_time TIMESTAMPTZ,
            summary TEXT,
            group_id INTEGER
        );
    `;
    return await pool.query(createTableQuery);
}

export { fetchSchedule, saveScheduleToDB, fetchAndSaveSchedule, initializeScheduleTable };