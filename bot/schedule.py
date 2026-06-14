import asyncio
import requests
from datetime import datetime, timedelta
from icalendar import Calendar
from db import get_connection

_sent_notifications = set()

async def add_lesson(telegram_id: int, time_str: str, name: str, date_str: str = None):
    if date_str is None:
        date_str = datetime.now().date().isoformat()
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO schedule (telegram_id, date, time, name, place, enabled) VALUES (?, ?, ?, ?, ?, 1)",
            (telegram_id, date_str, time_str, name, "")
        )
        conn.commit()
    return True

async def get_user_schedule(telegram_id: int):
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT date, time, name, place, enabled FROM schedule WHERE telegram_id = ?",
            (telegram_id,)
        ).fetchall()
    return [dict(row) for row in rows]

async def get_today_schedule(telegram_id: int):
    today = datetime.now().date().isoformat()
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT time, name FROM schedule WHERE telegram_id = ? AND date = ? AND enabled = 1",
            (telegram_id, today)
        ).fetchall()
    return [{"time": row["time"], "name": row["name"]} for row in rows]

async def import_ical_from_url(telegram_id: int, url: str):
    try:
        response = requests.get(url, timeout=30, verify=False)
        response.raise_for_status()
        cal = Calendar.from_ical(response.text)
        events = []
        for component in cal.walk():
            if component.name == "VEVENT":
                summary = str(component.get('SUMMARY', 'Без названия'))
                dtstart = component.get('DTSTART')
                if not dtstart:
                    continue
                start = dtstart.dt
                if isinstance(start, datetime):
                    date_str = start.strftime("%Y-%m-%d")
                    time_str = start.strftime("%H:%M")
                    events.append((date_str, time_str, summary))
        if not events:
            return False, "❌ В календаре нет событий."
        # Удаляем старые пары пользователя
        with get_connection() as conn:
            conn.execute("DELETE FROM schedule WHERE telegram_id = ?", (telegram_id,))
            for date_str, time_str, name in events:
                conn.execute(
                    "INSERT INTO schedule (telegram_id, date, time, name, place, enabled) VALUES (?, ?, ?, ?, ?, 1)",
                    (telegram_id, date_str, time_str, name, "")
                )
            conn.commit()
        return True, f"✅ Загружено {len(events)} событий. Используй /schedule для просмотра на сегодня."
    except Exception as e:
        return False, f"❌ Ошибка загрузки: {e}"

async def check_and_send_notifications(bot, telegram_id: int):
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT time, name FROM schedule WHERE telegram_id = ? AND date = ? AND enabled = 1",
            (telegram_id, datetime.now().date().isoformat())
        ).fetchall()
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    for row in rows:
        ev_time = row["time"]
        ev_dt = datetime.strptime(ev_time, "%H:%M")
        reminder_dt = ev_dt - timedelta(minutes=15)
        reminder_time = reminder_dt.strftime("%H:%M")
        if current_time == reminder_time:
            key = f"{telegram_id}_{ev_time}_{now.date()}"
            if key not in _sent_notifications:
                _sent_notifications.add(key)
                message = f"🔔 Напоминание о паре!\n\n📚 {row['name']}\n⏰ Через 15 минут (в {ev_time})\n🐾 Покорми питомца своим присутствием!"
                try:
                    await bot.send_message(telegram_id, message)
                except:
                    pass
                break

async def send_morning_schedule(bot, telegram_id: int):
    events = await get_today_schedule(telegram_id)
    if not events:
        message = "🌅 Доброе утро! Сегодня у тебя нет пар. Отдохни и покорми питомца игрой!"
    else:
        lines = [f"⏰ {ev['time']} – {ev['name']}" for ev in events]
        message = "🌅 Доброе утро! Твои пары на сегодня:\n\n" + "\n".join(lines) + "\n\n🐾 Не забывай кормить питомца посещением пар!"
    try:
        await bot.send_message(telegram_id, message)
    except:
        pass
