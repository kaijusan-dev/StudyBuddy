import ical from 'node-ical';
import fetch from 'node-fetch';
import {pool} from '../db.js';
import https from 'https';

async function fetchSchedule(calendarUrl) {
  console.log("Fetching schedule...");

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const res = await fetch(calendarUrl, {agent});
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
  console.log("Schedule fetched:", schedule.length, "events");
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
        client.release();
    }
}

async function fetchAndSaveSchedule(calendarUrl) {
    try {
        const schedule = await fetchSchedule(calendarUrl);
        await saveScheduleToDB(schedule);
    }
    catch (err) {
        console.error('Error fetching or saving schedule:', err);
    }
}

export { fetchSchedule, saveScheduleToDB, fetchAndSaveSchedule };