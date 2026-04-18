import json
import asyncio
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
from config import SCHEDULE_DATA_FILE

# Хранилище расписаний пользователей {telegram_id: [{"time": "10:30", "name": "Math", ...}]}
_schedules: Dict[int, List[dict]] = {}
_scheduler_task: Optional[asyncio.Task] = None
_daily_task: Optional[asyncio.Task] = None   # новая задача для утренней рассылки

def load_schedules():
    """Загружает расписания из файла"""
    global _schedules
    try:
        if SCHEDULE_DATA_FILE.exists():
            with open(SCHEDULE_DATA_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                _schedules = {int(k): v for k, v in data.items()}
        else:
            _schedules = {}
    except Exception as e:
        print(f"Ошибка загрузки расписаний: {e}")
        _schedules = {}

def save_schedules():
    """Сохраняет расписания в файл"""
    with open(SCHEDULE_DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump({str(k): v for k, v in _schedules.items()}, f, ensure_ascii=False, indent=2)

def get_user_schedule(telegram_id: int) -> List[dict]:
    """Возвращает расписание пользователя"""
    return _schedules.get(telegram_id, [])

def add_lesson(telegram_id: int, time_str: str, name: str, place: str = "") -> bool:
    """Добавляет пару в расписание"""
    try:
        datetime.strptime(time_str, "%H:%M")
    except ValueError:
        return False
    
    if telegram_id not in _schedules:
        _schedules[telegram_id] = []
    
    _schedules[telegram_id].append({
        "time": time_str,
        "name": name,
        "place": place,
        "enabled": True
    })
    _schedules[telegram_id].sort(key=lambda x: x["time"])
    save_schedules()
    return True

def remove_lesson(telegram_id: int, index: int) -> bool:
    """Удаляет пару по индексу (1-based)"""
    schedule = _schedules.get(telegram_id, [])
    if 1 <= index <= len(schedule):
        del schedule[index - 1]
        if not schedule:
            del _schedules[telegram_id]
        save_schedules()
        return True
    return False

def clear_schedule(telegram_id: int):
    """Очищает всё расписание пользователя"""
    if telegram_id in _schedules:
        del _schedules[telegram_id]
        save_schedules()

def toggle_lesson(telegram_id: int, index: int) -> bool:
    """Включает/выключает напоминание для пары"""
    schedule = _schedules.get(telegram_id, [])
    if 1 <= index <= len(schedule):
        schedule[index - 1]["enabled"] = not schedule[index - 1].get("enabled", True)
        save_schedules()
        return True
    return False

async def check_schedules(bot):
    """Проверяет расписания и отправляет уведомления за 15 минут до пары"""
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    current_date = now.date()
    
    if not hasattr(check_schedules, "sent_notifications"):
        check_schedules.sent_notifications = {}
    
    for telegram_id, lessons in _schedules.items():
        for i, lesson in enumerate(lessons):
            if not lesson.get("enabled", True):
                continue
            
            lesson_time = lesson["time"]
            lesson_name = lesson["name"]
            lesson_place = lesson.get("place", "")
            
            reminder_time = (datetime.strptime(lesson_time, "%H:%M") - timedelta(minutes=15)).strftime("%H:%M")
            notification_key = f"{telegram_id}_{i}_{current_date}_{lesson_time}"
            
            if current_time == reminder_time and notification_key not in check_schedules.sent_notifications:
                check_schedules.sent_notifications[notification_key] = True
                
                message = (
                    f"🔔 Напоминание о паре!\n\n"
                    f"📚 {lesson_name}\n"
                    f"⏰ Через 15 минут (в {lesson_time})\n"
                )
                if lesson_place:
                    message += f"📍 Место: {lesson_place}\n"
                message += f"\n🐾 Покорми питомца своим присутствием!"
                
                try:
                    await bot.send_message(telegram_id, message)
                except Exception as e:
                    print(f"Ошибка отправки уведомления {telegram_id}: {e}")
            
            if len(check_schedules.sent_notifications) > 100:
                check_schedules.sent_notifications.clear()

async def send_daily_schedule(bot):
    """Отправляет пользователям расписание на сегодня в 7:00 утра"""
    while True:
        now = datetime.now()
        target = now.replace(hour=7, minute=0, second=0, microsecond=0)
        if now >= target:
            target += timedelta(days=1)
        wait_seconds = (target - now).total_seconds()
        await asyncio.sleep(wait_seconds)
        
        today = datetime.now().date()
        for telegram_id, lessons in _schedules.items():
            # Здесь можно фильтровать по дню недели, если добавить поле day
            # Пока выводим все пары (без привязки к дате)
            if not lessons:
                message = "🌅 Доброе утро! Сегодня у тебя нет пар. Отдохни и покорми питомца игрой!"
            else:
                lessons_text = "\n".join(
                    f"⏰ {l['time']} – {l['name']}" + (f" ({l['place']})" if l.get('place') else "")
                    for l in lessons
                )
                message = f"🌅 Доброе утро! Твои пары на сегодня:\n\n{lessons_text}\n\n🐾 Не забывай кормить питомца посещением пар!"
            
            try:
                await bot.send_message(telegram_id, message)
            except Exception as e:
                print(f"Ошибка отправки утреннего расписания {telegram_id}: {e}")
        
        # Небольшая пауза, чтобы не отправить повторно
        await asyncio.sleep(60)

async def start_scheduler(app):
    """Запускает фоновые задачи: проверка расписаний и утренняя рассылка"""
    global _scheduler_task, _daily_task
    
    async def scheduler_loop():
        while True:
            await check_schedules(app.bot)
            await asyncio.sleep(60)
    
    _scheduler_task = asyncio.create_task(scheduler_loop())
    _daily_task = asyncio.create_task(send_daily_schedule(app.bot))
    print("✅ Планировщик уведомлений и утренней рассылки запущен")

def stop_scheduler():
    """Останавливает планировщик"""
    global _scheduler_task, _daily_task
    if _scheduler_task:
        _scheduler_task.cancel()
    if _daily_task:
        _daily_task.cancel()
