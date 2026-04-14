import ical from 'node-ical';
import fetch from 'node-fetch';
import https from 'https';
import * as scheduleRepository from './schedule.repository.js';
import { updateUser } from '#profile';

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
          start: event.start,
          end: event.end,
          summary: event.summary,
        });
    }
  }
  console.log("Schedule fetched:", schedule.length, "events");
  return schedule;
}

async function fetchAndSaveSchedule(calendarUrl, user_id) {
    try {
        const schedule = await fetchSchedule(calendarUrl);
        await updateUser(user_id, { calendar_url: calendarUrl });
        return await scheduleRepository.saveSchedule(schedule, user_id);
    }
    catch (err) {
        console.error('Error fetching or saving schedule:', err);
    }
}

async function getScheduleFromDB(user_id) {
    const result = await scheduleRepository.getSchedule(user_id);
    if (!result) {
        let newSchedule;
        try {
            const calendarUrl = await scheduleRepository.getScheduleUrl(user_id);
            if (calendarUrl) {
                newSchedule = await fetchAndSaveSchedule(calendarUrl, user_id);
            } else {
                console.warn('No calendar URL found for user:', user_id);
            }
        }
        catch (err) {
            console.error('Error fetching schedule URL or updating schedule:', err);
        }
        finally {
            return newSchedule || [];
        }
        
    }
    return result;
}

export { getScheduleFromDB, fetchAndSaveSchedule };