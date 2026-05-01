import requests
import warnings
from icalendar import Calendar
from datetime import datetime
from schedule import add_lesson, _schedules, save_schedules

# Отключаем предупреждения о небезопасном SSL (для чистоты вывода)
from urllib3.exceptions import InsecureRequestWarning
warnings.simplefilter('ignore', InsecureRequestWarning)

def parse_ical_from_url(url: str):
    """Скачивает и парсит iCal-файл, возвращает список событий (пар)"""
    try:
        print(f"Загрузка календаря: {url}")
        # verify=False отключает проверку SSL сертификата
        response = requests.get(url, timeout=30, verify=False)
        print(f"Статус ответа: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Ошибка HTTP: {response.status_code}")
            return None
        
        # Показываем первые 200 символов для диагностики
        content_preview = response.text[:200]
        print(f"Первые 200 символов ответа:\n{content_preview}")
        
        # Проверяем, что это похоже на iCal
        if not content_preview.strip().startswith('BEGIN:VCALENDAR'):
            print("Ответ не начинается с BEGIN:VCALENDAR, возможно, это не iCal файл.")
            return None
        
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
                    time_str = start.strftime("%H:%M")
                    is_today = (start.date() == datetime.now().date())
                else:
                    # Если только дата (без времени) – пропускаем
                    continue
                
                location = str(component.get('LOCATION', ''))
                events.append({
                    "time": time_str,
                    "name": summary,
                    "place": location,
                    "is_today": is_today
                })
        
        events.sort(key=lambda x: x["time"])
        print(f"Найдено событий: {len(events)}")
        return events
    except Exception as e:
        print(f"Ошибка парсинга календаря: {e}")
        return None

def sync_calendar_to_schedule(telegram_id: int, calendar_url: str):
    """Загружает календарь и заменяет расписание пользователя событиями на сегодня"""
    events = parse_ical_from_url(calendar_url)
    if events is None:
        return False, "❌ Не удалось загрузить календарь. Проверь ссылку или наличие событий на сегодня."

    # Очищаем текущее расписание пользователя
    if telegram_id in _schedules:
        del _schedules[telegram_id]

    added = 0
    for ev in events:
        # Добавляем только сегодняшние пары
        if ev["is_today"]:
            add_lesson(telegram_id, ev["time"], ev["name"], ev["place"])
            added += 1

    save_schedules()
    if added == 0:
        return True, "⚠️ Календарь загружен, но на сегодня нет событий."
    return True, f"✅ Добавлено {added} пар из календаря на сегодня."