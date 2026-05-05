import random
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

# Импорты из наших модулей
from config import TELEGRAM_TOKEN, BACKEND_URL
from pet import get_pet, update_pet
from schedule import get_schedule
from auth import get_token_for_user
from utils import get_random_quote
from weather import get_weather, POPULAR_CITIES
from keyboards import get_cities_keyboard, get_delete_pet_keyboard

# ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (НЕ МЕНЯЮТСЯ) =====
# Они уже были, оставляем как есть

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    token = await get_token_for_user(user.id)
    if token:
        await update.message.reply_text(
            f"Привет, {user.first_name}! ✅ Твой аккаунт привязан. Используй команды:\n"
            f"/pet – питомец\n/schedule – расписание\n/feed – покормить\n/play – сыграть в игру\n"
            f"/quote – цитата\n/weather – погода\n/rps – камень-ножницы-бумага\n/help – справка"
        )
    else:
        await update.message.reply_text(
            f"Привет, {user.first_name}! ❌ Твой Telegram ID не найден в системе.\n"
            "Пожалуйста, введи свой Telegram ID на сайте в настройках профиля, а затем попробуй снова."
        )

# ===== КОМАНДЫ, РАБОТАЮЩИЕ ЧЕРЕЗ API =====

async def pet_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    pet = await get_pet(tg_id)
    if pet is None:
        await update.message.reply_text("❌ Не удалось получить данные питомца. Проверь привязку и запуск бэкенда.")
        return
    fullness = pet.get("fullness", 0)
    happiness = pet.get("happiness", 0)
    energy = pet.get("energy", 0)
    level = pet.get("level", 1)
    xp = pet.get("xp", 0)
    coins = pet.get("coins", 0)
    if fullness < 30:
        mood = "🍔 Голодный"
    elif happiness < 30:
        mood = "😔 Грустный"
    elif fullness > 80 and happiness > 80:
        mood = "😊 Счастливый"
    else:
        mood = "😐 Обычное"
    text = (
        f"🐾 **Питомец**\n"
        f"⭐ Уровень: {level}\n"
        f"📊 Опыт: {xp}\n"
        f"😊 Настроение: {mood}\n\n"
        f"🍔 Сытость: {fullness}%\n"
        f"😊 Счастье: {happiness}%\n"
        f"⚡ Энергия: {energy}%\n"
        f"🪙 Монеты: {coins}\n"
    )
    await update.message.reply_text(text, parse_mode="Markdown")

async def feed_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    result = await update_pet(tg_id, "feed")
    if result is None:
        await update.message.reply_text("❌ Не удалось покормить питомца. Попробуй позже.")
        return
    fullness = result.get("fullness")
    await update.message.reply_text(f"🍽️ Ты покормил питомца! Сытость теперь {fullness}%.")

async def play_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Для упрощения сразу отправляем "win" – позже можно сделать полноценную игру
    tg_id = update.effective_user.id
    result = await update_pet(tg_id, "play", result="win")
    if result is None:
        await update.message.reply_text("❌ Ошибка игры. Попробуй позже.")
        return
    happiness = result.get("happiness")
    coins = result.get("coins")
    await update.message.reply_text(f"🎉 Победа! Счастье питомца: {happiness}%. Монет: {coins}.")

async def schedule_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    data = await get_schedule(tg_id)
    if data is None:
        await update.message.reply_text("❌ Не удалось загрузить расписание. Убедись, что бэкенд запущен и твой аккаунт привязан.")
        return
    today = datetime.now().date().isoformat()
    lessons_today = [l for l in data if l.get("date") == today]
    if not lessons_today:
        await update.message.reply_text("📅 На сегодня пар нет.")
        return
    text = "📅 **Расписание на сегодня:**\n\n"
    for l in lessons_today:
        text += f"⏰ {l['time']} – {l['name']}"
        if l.get('place'):
            text += f" ({l['place']})"
        text += "\n"
    await update.message.reply_text(text, parse_mode="Markdown")

# ===== СТАРЫЕ КОМАНДЫ (НЕ ТРОГАЕМ) =====

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
        # Здесь нужно будет вызвать API для удаления питомца, пока заглушка
        await query.edit_message_text("🗑️ Питомец удалён (заглушка).")
    else:
        await query.edit_message_text("✅ Отлично! Питомец остался с тобой.")

# ===== КОМАНДЫ УПРАВЛЕНИЯ РАСПИСАНИЕМ (ЛОКАЛЬНЫЕ, НЕ ТРОГАЕМ) =====
# Они используют старые функции из schedule.py (работу с JSON). Пока оставим как есть.

async def add_lesson_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # старая реализация, работающая с локальным JSON
    await update.message.reply_text("⏳ Управление расписанием пока работает локально. Скоро добавим через API.")

async def schedule_edit(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("⏳ Редактирование расписания пока недоступно. Используйте API в следующей версии.")

async def schedule_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.callback_query.answer()
    await update.callback_query.edit_message_text("⏳ Функция временно отключена.")

async def handle_text_input(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Обработка текстовых сообщений (погода по названию города и т.д.)
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
        "📋 **Команды:**\n\n"
        "🐾 **Питомец:**\n"
        "/pet – состояние питомца\n/feed – покормить\n/play – сыграть в игру\n/delete_pet – удалить питомца\n\n"
        "📅 **Расписание:**\n/schedule – показать пары на сегодня\n\n"
        "🎮 **Развлечения:**\n/quote – цитата\n/weather [город] – погода\n/cities – выбрать город\n/rps – камень-ножницы-бумага\n\n"
        "ℹ️ **Другое:**\n/start – приветствие\n/help – эта справка\n\n"
        "🍔 Совет: Ходи на пары, чтобы питомец был сытым!"
    )
