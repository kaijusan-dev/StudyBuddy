import random
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

from config import TELEGRAM_TOKEN
from pet import get_pet_info, feed_pet, delete_pet
from auth import authorize_user
from utils import get_random_quote
from weather import get_weather, POPULAR_CITIES
from keyboards import get_cities_keyboard, get_delete_pet_keyboard
from schedule import (
    get_user_schedule, add_lesson, remove_lesson,
    toggle_lesson, clear_schedule
)
from keyboards import get_schedule_keyboard, get_schedule_remove_keyboard

# ===== ОСНОВНЫЕ КОМАНДЫ (питомец, цитаты, погода, игры) =====

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    telegram_id = user.id
    await get_pet_info(telegram_id)
    await authorize_user(telegram_id)
    await update.message.reply_text(
        f"Привет, {user.first_name}! 🐾 У тебя появился питомец!\n\n"
        f"Команды:\n"
        f"/pet – состояние питомца\n"
        f"/feed – покормить\n"
        f"/delete_pet – удалить питомца\n"
        f"/quote – цитата\n"
        f"/weather – погода\n"
        f"/rps – игра\n"
        f"/schedule – расписание\n"
        f"/add_lesson – добавить пару\n"
        f"/set_calendar – привязать календарь\n\n"
        f"🍔 Ходи на пары, чтобы кормить питомца!"
    )

async def pet_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    info = await get_pet_info(telegram_id)
    if info is None:
        await update.message.reply_text("❌ Ошибка получения данных питомца")
        return
    text = (
        f"🐾 {info['name']}\n"
        f"⭐ Уровень: {info['level']}\n"
        f"😊 Настроение: {info['mood']}\n\n"
        f"🍔 Сытость: {info['fullness']}%\n"
        f"{info['fullness_bar']}\n\n"
        f"😊 Счастье: {info['happiness']}%\n"
        f"{info['happiness_bar']}\n\n"
        f"⚡ Энергия: {info['energy']}%\n\n"
        f"📌 Совет: Ходи на пары, чтобы покормить питомца!\n"
        f"🍽️ Покормить: /feed\n"
        f"🗑️ Удалить: /delete_pet"
    )
    await update.message.reply_text(text)

async def feed_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    result = await feed_pet(telegram_id)
    if result['new_fullness'] == 100:
        message = f"🍖 Питомец наелся досыта!\nСытость: {result['old_fullness']}% → {result['new_fullness']}%\n😊 Счастье: {result['happiness']}%\n\nПитомец довольно урчит 😺"
    else:
        message = f"🍽️ Ты покормил питомца!\nСытость: {result['old_fullness']}% → {result['new_fullness']}%\n😊 Счастье: {result['happiness']}%\n\nСпасибо, что заботишься о питомце! 🐾"
    await update.message.reply_text(message)

async def delete_pet_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    reply_markup = get_delete_pet_keyboard()
    await update.message.reply_text(
        f"⚠️ Внимание, {user.first_name}!\n\n"
        f"Ты уверена, что хочешь удалить своего питомца?\n"
        f"Все данные о нём будут потеряны.\n\n"
        f"После удаления можно будет создать нового командой /start.",
        reply_markup=reply_markup
    )

async def delete_pet_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    telegram_id = update.effective_user.id
    data = query.data
    if data == "confirm_delete":
        success = await delete_pet(telegram_id)
        if success:
            await query.edit_message_text("🗑️ Питомец удалён.\n\nТы всегда можешь создать нового командой /start.\nБудем скучать... 🐾")
        else:
            await query.edit_message_text("❌ У тебя не было питомца.\nСоздать нового можно командой /start.")
    else:
        await query.edit_message_text("✅ Отлично! Питомец остался с тобой.\n\nЗаботься о нём: /feed и /pet")

async def quote(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"💬 {get_random_quote()}")

async def weather_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args:
        await update.message.reply_text("❓ Напиши так: /weather Москва")
        return
    city = " ".join(context.args)
    await update.message.reply_text(f"🔍 Ищу погоду в {city}...")
    info = get_weather(city)
    if info:
        await update.message.reply_text(info)
    else:
        await update.message.reply_text(f"❌ Не могу найти город {city}.")

async def cities_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    reply_markup = get_cities_keyboard(POPULAR_CITIES)
    await update.message.reply_text("Выбери город из списка:", reply_markup=reply_markup)

async def city_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    city = query.data.replace("city_", "")
    await query.edit_message_text(f"🔍 Ищу погоду в {city}...")
    info = get_weather(city)
    if info:
        await query.edit_message_text(info)
    else:
        await query.edit_message_text(f"❌ Не могу найти город {city}.")

# ===== КОМАНДЫ РАСПИСАНИЯ =====

async def schedule_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    lessons = get_user_schedule(telegram_id)
    if not lessons:
        await update.message.reply_text(
            "📅 У тебя пока нет пар в расписании.\n\n"
            "Добавить: /add_lesson Время Название\n"
            "Пример: /add_lesson 10:30 Математика\n"
            "Или используй /schedule_edit для управления"
        )
        return
    text = "📅 Твоё расписание:\n\n"
    for i, lesson in enumerate(lessons, 1):
        status = "✅" if lesson.get("enabled", True) else "❌"
        place_info = f" ({lesson.get('place', '')})" if lesson.get('place') else ""
        text += f"{status} {i}. {lesson['name']} — {lesson['time']}{place_info}\n"
    text += "\n/schedule_edit — управление расписанием"
    await update.message.reply_text(text)

async def schedule_edit(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    lessons = get_user_schedule(telegram_id)
    if not lessons:
        await update.message.reply_text("📅 У тебя пока нет пар. Добавь: /add_lesson")
        return
    reply_markup = get_schedule_keyboard(lessons)
    await update.message.reply_text(
        "📅 Управление расписанием:\n\n"
        "Нажми на пару, чтобы включить/выключить напоминание.\n"
        "Используй кнопки внизу для добавления или удаления.",
        reply_markup=reply_markup
    )

async def add_lesson_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    args = context.args
    if len(args) < 2:
        await update.message.reply_text(
            "❓ Формат: /add_lesson Время Название [Место]\n\n"
            "Примеры:\n"
            "/add_lesson 10:30 Математика\n"
            "/add_lesson 12:00 Программирование 301"
        )
        return
    time_str = args[0]
    name = " ".join(args[1:3])
    place = " ".join(args[3:]) if len(args) > 3 else ""
    success = add_lesson(telegram_id, time_str, name, place)
    if success:
        await update.message.reply_text(
            f"✅ Добавлена пара:\n⏰ {time_str} — {name}\n{f'📍 {place}' if place else ''}\n\nНапоминание придёт за 15 минут."
        )
    else:
        await update.message.reply_text("❌ Неверный формат времени. Используй ЧЧ:ММ (пример: 10:30)")

async def schedule_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    telegram_id = update.effective_user.id
    data = query.data
    lessons = get_user_schedule(telegram_id)

    if data == "schedule_add":
        context.user_data["adding_lesson"] = True
        await query.edit_message_text(
            "✏️ Введи время и название пары.\n\n"
            "Формат: 10:30 Математика\n"
            "Или: 10:30 Математика 301\n\n"
            "Для отмены нажми /cancel"
        )
        return
    elif data == "schedule_remove":
        reply_markup = get_schedule_remove_keyboard(lessons)
        await query.edit_message_text("Выбери пару для удаления:", reply_markup=reply_markup)
        return
    elif data == "schedule_back":
        reply_markup = get_schedule_keyboard(lessons)
        await query.edit_message_text("📅 Управление расписанием:", reply_markup=reply_markup)
        return
    elif data == "schedule_close":
        await query.edit_message_text("✅ Меню закрыто")
        return
    elif data.startswith("schedule_toggle_"):
        index = int(data.split("_")[-1])
        toggle_lesson(telegram_id, index)
        lessons = get_user_schedule(telegram_id)
        reply_markup = get_schedule_keyboard(lessons)
        await query.edit_message_text("📅 Управление расписанием (обновлено):", reply_markup=reply_markup)
        return
    elif data.startswith("schedule_remove_confirm_"):
        index = int(data.split("_")[-1])
        removed = remove_lesson(telegram_id, index)
        if removed:
            lessons = get_user_schedule(telegram_id)
            if lessons:
                reply_markup = get_schedule_keyboard(lessons)
                await query.edit_message_text("✅ Пара удалена. Управление расписанием:", reply_markup=reply_markup)
            else:
                await query.edit_message_text("✅ Пара удалена. Расписание пусто.")
        else:
            await query.edit_message_text("❌ Ошибка при удалении")
        return

async def handle_text_input(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обрабатывает текстовый ввод (для добавления пары вручную)"""
    if context.user_data.get("adding_lesson"):
        context.user_data["adding_lesson"] = False
        text = update.message.text.strip()
        parts = text.split()
        if len(parts) < 2:
            await update.message.reply_text("❌ Неверный формат. Нужно: Время Название\nПример: 10:30 Математика")
            return
        time_str = parts[0]
        name = " ".join(parts[1:3])
        place = " ".join(parts[3:]) if len(parts) > 3 else ""
        success = add_lesson(update.effective_user.id, time_str, name, place)
        if success:
            await update.message.reply_text(f"✅ Добавлена пара:\n⏰ {time_str} — {name}\n{f'📍 {place}' if place else ''}")
        else:
            await update.message.reply_text("❌ Неверный формат времени. Используй ЧЧ:ММ")
        return
    # Если не в режиме добавления – обрабатываем как обычное сообщение
    text = update.message.text.strip().lower()
    if len(text) > 2 and not text.startswith('/') and text not in ['привет', 'как дела', 'пока', 'спасибо']:
        weather_info = get_weather(update.message.text.strip())
        if weather_info:
            await update.message.reply_text(weather_info)
            return
    if 'как дела' in text:
        await update.message.reply_text(random.choice(["Да норм!", "Отлично!", "Лучше всех!"]))
    elif 'привет' in text:
        await update.message.reply_text("Здарова!")
    elif 'пока' in text:
        await update.message.reply_text("Бывай!")
    elif 'спасибо' in text:
        await update.message.reply_text("Всегда пожалуйста! 😎")
    else:
        await update.message.reply_text("Не понял. Напиши /help.")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📋 Команды:\n\n"
        "🐾 Питомец:\n/pet – состояние\n/feed – покормить\n/delete_pet – удалить\n\n"
        "📅 Расписание:\n/schedule – показать\n/schedule_edit – управление\n/add_lesson – добавить пару\n\n"
        "📅 Календарь:\n/set_calendar ССЫЛКА – привязать iCal\n/sync_calendar – синхронизировать\n/show_calendar – показать ссылку\n\n"
        "🎮 Развлечения:\n/quote – цитата\n/weather [город] – погода\n/cities – выбрать город\n/rps – игра\n\n"
        "ℹ️ /start – приветствие\n/help – эта справка\n\n"
        "🍔 Совет: Ходи на пары, чтобы питомец был сытым!"
    )

# ===== СИНХРОНИЗАЦИЯ С КАЛЕНДАРЁМ =====

async def set_calendar_url(update: Update, context: ContextTypes.DEFAULT_TYPE):
    args = context.args
    if not args:
        await update.message.reply_text(
            "❓ Формат: /set_calendar ССЫЛКА\n\n"
            "Пример: /set_calendar https://ical.psu.ru/calendars/xxx.ics"
        )
        return
    url = args[0]
    context.user_data["calendar_url"] = url
    from calendar_sync import sync_calendar_to_schedule
    success, msg = sync_calendar_to_schedule(update.effective_user.id, url)
    await update.message.reply_text(msg)

async def sync_calendar(update: Update, context: ContextTypes.DEFAULT_TYPE):
    url = context.user_data.get("calendar_url")
    if not url:
        await update.message.reply_text("❌ Сначала установи ссылку командой /set_calendar ССЫЛКА")
        return
    from calendar_sync import sync_calendar_to_schedule
    success, msg = sync_calendar_to_schedule(update.effective_user.id, url)
    await update.message.reply_text(msg)

async def show_calendar_url(update: Update, context: ContextTypes.DEFAULT_TYPE):
    url = context.user_data.get("calendar_url")
    if url:
        await update.message.reply_text(f"📅 Твоя ссылка:\n`{url}`")
    else:
        await update.message.reply_text("❌ Нет сохранённой ссылки. Установи /set_calendar")