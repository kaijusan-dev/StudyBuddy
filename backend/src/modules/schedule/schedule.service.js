import ical from 'node-ical';
import fetch from 'node-fetch';
import https from 'https';
import * as scheduleRepository from './schedule.repository.js';
import { updateUser } from '#profile';

async function fetchSchedule(calendarUrl) {
  console.log("Fetching schedule...");

  const agent =
    process.env.MODE === "development"
      ? new https.Agent({
          rejectUnauthorized: false,
        })
      : undefined;

  const res = await fetch(calendarUrl, { agent });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch calendar: ${res.status}`
    );
  }

  const text = await res.text();

  const events = ical.parseICS(text);

  const schedule = [];

  for (const event of Object.values(events)) {

    if (
      event.type !== "VEVENT" ||
      !event.start ||
      !event.end ||
      !event.summary
    ) {
      continue;
    }

    schedule.push({
      start: event.start,
      end: event.end,
      summary: event.summary,
    });

    if (schedule.length >= 1000) {
      break;
    }
  }

  console.log(
    "Schedule fetched:",
    schedule.length,
    "events"
  );

  return schedule;
}

async function fetchAndSaveSchedule(calendarUrl, user_id) {
    try {
        const schedule = await fetchSchedule(calendarUrl);

        if (schedule.length === 0) {
            throw new Error("Неверная Ссылка ЕТИС");
        }

        await updateUser(user_id, { calendar_url: calendarUrl });

        return await scheduleRepository.saveSchedule(
            schedule,
            user_id
        );
    }
    catch (err) {
        console.error(
            'Error fetching or saving schedule:',
            err
        );

        throw err;
    }
}

async function getScheduleFromDB(user_id) {
    try {
        const result = await scheduleRepository.getSchedule(user_id);

        if (result?.length > 0) {
            return result;
        }

        const calendarUrl = await scheduleRepository.getScheduleUrl(user_id);

        if (!calendarUrl) return [];

        return await fetchAndSaveSchedule(calendarUrl, user_id);
    } catch (err) {
        console.error('getScheduleFromDB failed:', err);
        throw err; 
    }
}

const createEvent = async (data) => {
  const { start_time, end_time, summary } = data;

  if (!start_time || !end_time || !summary) {
    throw new Error("Missing required fields");
  }

  if (new Date(start_time) >= new Date(end_time)) {
    throw new Error("Start time must be before end time");
  }

  return await scheduleRepository.addEventToSchedule({
    ...data
  });
};

const updateEvent = async (id, userId, data) => {
  if (!id) {
    throw new Error("Event id is required");
  }

  if (data.start_time && data.end_time) {
    if (new Date(data.start_time) >= new Date(data.end_time)) {
      throw new Error("Start time must be before end time");
    }
  }

  return await scheduleRepository.updateSchedule(id, userId, data);
};

const deleteEvent = async (id, userId) => {
  if (!id) {
    throw new Error("Event id is required");
  }

  const deleted = await scheduleRepository.deleteEventFromSchedule(id);

  if (!deleted) {
    throw new Error("Event not found");
  }

  return deleted;
};


export { getScheduleFromDB, fetchAndSaveSchedule, createEvent, updateEvent, deleteEvent };