import asyncio
from datetime import datetime, timedelta
from typing import Set
from config import BACKEND_URL
from auth import get_token_for_user
import httpx

_sent_notifications: Set[str] = set()

async def get_schedule(telegram_id: int):
    """Возвращает все события расписания (список)"""
    token = await get_token_for_user(telegram_id)
    if not token:
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"Authorization": f"Bearer {token}"}
            resp = await client.get(f"{BACKEND_URL}/api/schedule", headers=headers)
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        print(f"Ошибка получения расписания: {e}")
    return None

async def get_today_schedule(telegram_id: int):
    """Возвращает расписание на сегодня (отфильтрованное)"""
    data = await get_schedule(telegram_id)
    if not data:
        return None
    today = datetime.now().date().isoformat()
    today_events = []
    for ev in data:
        start_time = ev.get("start_time")
        if start_time and start_time[:10] == today:
            time_part = start_time[11:16]
            today_events.append({
                "time": time_part,
                "name": ev.get("summary", "Без названия"),
                "start_time": start_time
            })
    return sorted(today_events, key=lambda x: x["time"])

async def check_and_send_notifications(bot, telegram_id: int):
    schedule = await get_today_schedule(telegram_id)
    if not schedule:
        return
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    for ev in schedule:
        ev_time = ev["time"]
        ev_dt = datetime.strptime(ev_time, "%H:%M")
        reminder_dt = ev_dt - timedelta(minutes=15)
        reminder_time = reminder_dt.strftime("%H:%M")
        if current_time == reminder_time:
            key = f"{telegram_id}_{ev['start_time']}_{now.date()}"
            if key not in _sent_notifications:
                _sent_notifications.add(key)
                message = (
                    f"🔔 Напоминание о паре!\n\n"
                    f"📚 {ev['name']}\n"
                    f"⏰ Через 15 минут (в {ev_time})\n"
                    f"🐾 Покорми питомца своим присутствием!"
                )
                try:
                    await bot.send_message(telegram_id, message)
                except Exception as e:
                    print(f"Ошибка отправки уведомления {telegram_id}: {e}")
                break

async def send_morning_schedule(bot, telegram_id: int):
    schedule = await get_today_schedule(telegram_id)
    if not schedule:
        message = "🌅 Доброе утро! Сегодня у тебя нет пар. Отдохни и покорми питомца игрой!"
    else:
        lines = [f"⏰ {ev['time']} – {ev['name']}" for ev in schedule]
        message = f"🌅 Доброе утро! Твои пары на сегодня:\n\n" + "\n".join(lines) + "\n\n🐾 Не забывай кормить питомца посещением пар!"
    try:
        await bot.send_message(telegram_id, message)
    except Exception as e:
        print(f"Ошибка утренней рассылки {telegram_id}: {e}")
