import random
import os
from telegram import Update
from telegram.ext import ContextTypes
from pet import (
    get_pet, feed_pet, play_pet, petting_pet, daily_bonus,
    determine_mood, get_mood_gif, add_coins, add_xp, xp_for_next_level
)
from schedule import get_today_schedule, add_lesson, import_ical_from_url
from admin import admin_panel

active_users = set()

ACTION_GIFS = {
    "feed": "sprite-animation (10).gif",
    "petting": "sprite-animation (11).gif",
    "play": "sprite-animation (12).gif"
}
import random
import os
from telegram import Update
from telegram.ext import ContextTypes
from pet import (
    get_pet, feed_pet, play_pet, petting_pet, daily_bonus,
    determine_mood, get_mood_gif, xp_for_next_level
)
from schedule import get_today_schedule, add_lesson, import_ical_from_url
from admin import admin_panel
from db import get_connection

active_users = set()

async def ensure_user_active(telegram_id: int) -> bool:
    """Проверяет, активен ли пользователь. Если нет, но он есть в БД – активирует. Если нет в БД – возвращает False."""
    if telegram_id in active_users:
        return True
    with get_connection() as conn:
        row = conn.execute("SELECT 1 FROM pets WHERE telegram_id = ?", (telegram_id,)).fetchone()
        if row:
            active_users.add(telegram_id)
            return True
    return False

ACTION_GIFS = {
    "feed": "sprite-animation (10).gif",
    "petting": "sprite-animation (11).gif",
    "play": "sprite-animation (12).gif"
}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    telegram_id = user.id
    await get_pet(telegram_id)
    active_users.add(telegram_id)
    await update.message.reply_text(
        f"Привет, {user.first_name}! 🐾 Добро пожаловать!\n\n"
        "Команды:\n"
        "/pet – состояние питомца\n"
        "/feed – покормить\n"
        "/petting – погладить\n"
        "/play – игра\n"
        "/daily – бонус\n"
        "/schedule – расписание на сегодня\n"
        "/set_calendar <url> – загрузить расписание\n"
        "/top – топ пользователей\n"
        "/help – справка"
    )

async def pet_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not await ensure_user_active(user_id):
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    pet = await get_pet(user_id)
    mood = determine_mood(pet)
    filename = get_mood_gif(mood)
    image_path = os.path.join("images", filename)
    caption = (
        f"🐾 **Питомец**\n"
        f"⭐ Уровень: {pet['level']}\n"
        f"📊 Опыт: {pet['xp']} / {xp_for_next_level(pet['level'])} до следующего\n"
        f"🪙 Монеты: {pet['coins']}\n\n"
        f"🍔 Сытость: {round(pet['fullness'])} / 30\n"
        f"😊 Счастье: {round(pet['happiness'])}%\n"
        f"⚡ Энергия: {round(pet['energy'])}%\n"
    )
    if os.path.exists(image_path):
        with open(image_path, 'rb') as anim:
            await update.message.reply_animation(animation=anim, caption=caption, parse_mode="Markdown")
    else:
        await update.message.reply_text(caption, parse_mode="Markdown")

async def feed_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not await ensure_user_active(user_id):
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    result, error = await feed_pet(user_id)
    if error:
        await update.message.reply_text(error)
        return
    feed_gif_path = os.path.join("images", ACTION_GIFS["feed"])
    if os.path.exists(feed_gif_path):
        with open(feed_gif_path, 'rb') as anim:
            await update.message.reply_animation(animation=anim, caption="🍽️ Кушает...")
    await update.message.reply_text(
        f"🍽️ Покормлен! Сытость: {round(result['fullness'])}/30, Счастье: {round(result['happiness'])}%, Опыт: {result['xp']}, Монеты: {result['coins']}"
    )

async def petting_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not await ensure_user_active(user_id):
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    result, error = await petting_pet(user_id)
    if error:
        await update.message.reply_text(error)
        return
    gif_path = os.path.join("images", ACTION_GIFS["petting"])
    if os.path.exists(gif_path):
        with open(gif_path, 'rb') as anim:
            await update.message.reply_animation(animation=anim, caption="🤗 Погладили питомца...")
    await update.message.reply_text(
        f"🤗 Питомец рад! Счастье: {round(result['happiness'])}%, Энергия: {round(result['energy'])}%, Опыт: {result['xp']}, Монеты: {result['coins']}"
    )

async def play_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not await ensure_user_active(user_id):
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    outcomes = ['win', 'lose', 'draw']
    result = random.choice(outcomes)
    updated, error = await play_pet(user_id, result)
    if error:
        await update.message.reply_text(error)
        return
    gif_path = os.path.join("images", ACTION_GIFS["play"])
    if os.path.exists(gif_path):
        with open(gif_path, 'rb') as anim:
            await update.message.reply_animation(animation=anim, caption="🎮 Играет...")
    await update.message.reply_text(
        f"🎮 Результат: {result.upper()}!\n"
        f"❤️ Счастье: {round(updated['happiness'])}%, "
        f"⚡ Энергия: {round(updated['energy'])}%, "
        f"✨ Опыт: {updated['xp']}, "
        f"🪙 Монеты: {updated['coins']}"
    )

async def daily_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not await ensure_user_active(user_id):
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    result, error = await daily_bonus(user_id)
    if error:
        await update.message.reply_text(error)
    else:
        await update.message.reply_text(
            f"🎁 Ежедневный бонус получен!\n"
            f"🍔 Сытость: +10, 😊 Счастье: +5, ✨ Опыт: +5, 🪙 Монеты: +1\n"
            f"Теперь: сытость {round(result['fullness'])}/30, счастье {round(result['happiness'])}%, опыт {result['xp']}, монеты {result['coins']}"
        )

async def schedule_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not await ensure_user_active(user_id):
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    events = await get_today_schedule(user_id)
    if not events:
        await update.message.reply_text("📅 На сегодня пар нет. Загрузи расписание через /set_calendar или добавь вручную /add_lesson.")
        return
    text = "📅 **Расписание на сегодня:**\n\n"
    for ev in events:
        text += f"⏰ {ev['time']} – {ev['name']}\n"
    await update.message.reply_text(text, parse_mode="Markdown")

async def set_calendar_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not await ensure_user_active(user_id):
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    args = context.args
    if not args:
        await update.message.reply_text("❓ Формат: /set_calendar https://example.com/calendar.ics")
        return
    url = args[0]
    await update.message.reply_text("⏳ Загружаю расписание, подождите...")
    success, message = await import_ical_from_url(user_id, url)
    await update.message.reply_text(message)

async def add_lesson_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not await ensure_user_active(user_id):
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    args = context.args
    if len(args) < 2:
        await update.message.reply_text("❓ Формат: /add_lesson 10:30 Название")
        return
    time_str = args[0]
    name = " ".join(args[1:])
    if add_lesson(user_id, time_str, name):
        await update.message.reply_text(f"✅ Добавлена пара: {time_str} – {name}")
    else:
        await update.message.reply_text("❌ Неверный формат времени (используй ЧЧ:ММ)")

async def top_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not await ensure_user_active(user_id):
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT telegram_id, level, xp FROM pets ORDER BY level DESC, xp DESC LIMIT 10"
        ).fetchall()
    if not rows:
        await update.message.reply_text("Нет данных для рейтинга.")
        return
    text = "🏆 **Топ пользователей по уровню** 🏆\n\n"
    for i, row in enumerate(rows, 1):
        text += f"{i}. ID {row['telegram_id']} — уровень {row['level']} (опыт {row['xp']})\n"
    await update.message.reply_text(text, parse_mode="Markdown")

async def admin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if not await ensure_user_active(user_id):
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    await admin_panel(update, context)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📋 **Команды:**\n"
        "/start – начать работу\n"
        "/pet – состояние питомца\n"
        "/feed – покормить\n"
        "/petting – погладить\n"
        "/play – игра\n"
        "/daily – бонус\n"
        "/schedule – расписание\n"
        "/set_calendar <url> – загрузить расписание\n"
        "/top – топ пользователей\n"
        "/help – справка"
    )

async def unknown_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("❌ Неизвестная команда. Используйте /help")
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    active_users.add(user.id)
    await get_pet(user.id)  # создаём питомца, если нет
    await update.message.reply_text(
        f"Привет, {user.first_name}! 🐾 Добро пожаловать!\n\n"
        "Команды:\n"
        "/pet – состояние питомца\n"
        "/feed – покормить (сытость +10, счастье +5, опыт +3, тратит 3 энергии)\n"
        "/petting – погладить (счастье +5, опыт +2, тратит 2 энергии)\n"
        "/play – сыграть (результат случайный)\n"
        "/daily – ежедневный бонус (+10 сытость, +5 счастье, +5 опыт, +1 монета)\n"
        "/schedule – расписание на сегодня\n"
        "/set_calendar <ссылка> – загрузить расписание из iCal\n"
        "/top – топ пользователей по уровню\n"
        "/help – справка"
    )

async def pet_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in active_users:
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    pet = await get_pet(user_id)
    mood = determine_mood(pet)
    filename = get_mood_gif(mood)
    image_path = os.path.join("images", filename)
    caption = (
        f"🐾 **Питомец**\n"
        f"⭐ Уровень: {pet['level']}\n"
        f"📊 Опыт: {pet['xp']} / {xp_for_next_level(pet['level'])} до следующего\n"
        f"🪙 Монеты: {pet['coins']}\n\n"
        f"🍔 Сытость: {round(pet['fullness'])} / 30\n"
        f"😊 Счастье: {round(pet['happiness'])}%\n"
        f"⚡ Энергия: {round(pet['energy'])}%\n"
    )
    if os.path.exists(image_path):
        with open(image_path, 'rb') as anim:
            await update.message.reply_animation(animation=anim, caption=caption, parse_mode="Markdown")
    else:
        await update.message.reply_text(caption, parse_mode="Markdown")

async def feed_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in active_users:
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    feed_gif_path = os.path.join("images", ACTION_GIFS["feed"])
    if os.path.exists(feed_gif_path):
        with open(feed_gif_path, 'rb') as anim:
            await update.message.reply_animation(animation=anim, caption="🍽️ Кушает...")
    result, error = await feed_pet(user_id)
    if error:
        await update.message.reply_text(error)
    else:
        await update.message.reply_text(
            f"🍽️ Покормлен! Сытость: {round(result['fullness'])}/30, Счастье: {round(result['happiness'])}%, Опыт: {result['xp']}, Монеты: {result['coins']}"
        )

async def petting_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in active_users:
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    gif_path = os.path.join("images", ACTION_GIFS["petting"])
    if os.path.exists(gif_path):
        with open(gif_path, 'rb') as anim:
            await update.message.reply_animation(animation=anim, caption="🤗 Погладили питомца...")
    result, error = await petting_pet(user_id)
    if error:
        await update.message.reply_text(error)
    else:
        await update.message.reply_text(
            f"🤗 Питомец рад! Счастье: {round(result['happiness'])}%, Энергия: {round(result['energy'])}%, Опыт: {result['xp']}, Монеты: {result['coins']}"
        )

async def play_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in active_users:
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    gif_path = os.path.join("images", ACTION_GIFS["play"])
    if os.path.exists(gif_path):
        with open(gif_path, 'rb') as anim:
            await update.message.reply_animation(animation=anim, caption="🎮 Играет...")
    outcomes = ['win', 'lose', 'draw']
    result = random.choice(outcomes)
    updated, error = await play_pet(user_id, result)
    if error:
        await update.message.reply_text(error)
    else:
        await update.message.reply_text(
            f"🎮 Результат: {result.upper()}!\n"
            f"❤️ Счастье: {round(updated['happiness'])}%, "
            f"⚡ Энергия: {round(updated['energy'])}%, "
            f"✨ Опыт: {updated['xp']}, "
            f"🪙 Монеты: {updated['coins']}"
        )

async def daily_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in active_users:
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    result, error = await daily_bonus(user_id)
    if error:
        await update.message.reply_text(error)
    else:
        await update.message.reply_text(
            f"🎁 Ежедневный бонус получен!\n"
            f"🍔 Сытость: +10, 😊 Счастье: +5, ✨ Опыт: +5, 🪙 Монеты: +1\n"
            f"Теперь: сытость {round(result['fullness'])}/30, счастье {round(result['happiness'])}%, опыт {result['xp']}, монеты {result['coins']}"
        )

async def schedule_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in active_users:
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    events = await get_today_schedule(user_id)
    if not events:
        await update.message.reply_text("📅 На сегодня пар нет. Загрузи расписание через /set_calendar или добавь вручную /add_lesson.")
        return
    text = "📅 **Расписание на сегодня:**\n\n"
    for ev in events:
        text += f"⏰ {ev['time']} – {ev['name']}\n"
    await update.message.reply_text(text, parse_mode="Markdown")

async def set_calendar_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in active_users:
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    args = context.args
    if not args:
        await update.message.reply_text("❓ Формат: /set_calendar https://example.com/calendar.ics")
        return
    url = args[0]
    await update.message.reply_text("⏳ Загружаю расписание, подождите...")
    success, message = await import_ical_from_url(user_id, url)
    await update.message.reply_text(message)

async def add_lesson_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in active_users:
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    args = context.args
    if len(args) < 2:
        await update.message.reply_text("❓ Формат: /add_lesson 10:30 Название")
        return
    time_str = args[0]
    name = " ".join(args[1:])
    if add_lesson(user_id, time_str, name):
        await update.message.reply_text(f"✅ Добавлена пара: {time_str} – {name}")
    else:
        await update.message.reply_text("❌ Неверный формат времени (используй ЧЧ:ММ)")

async def top_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in active_users:
        await update.message.reply_text("❌ Сначала авторизуйся через /start.")
        return
    from pet import load_pet_data, xp_for_next_level
    data = load_pet_data()
    if not data:
        await update.message.reply_text("Нет данных для рейтинга.")
        return
    users = []
    for uid, pet in data.items():
        level = pet.get("level", 1)
        xp = pet.get("xp", 0)
        users.append((uid, level, xp))
    users.sort(key=lambda x: (x[1], x[2]), reverse=True)
    top10 = users[:10]
    text = "🏆 **Топ пользователей по уровню** 🏆\n\n"
    for i, (uid, level, xp) in enumerate(top10, 1):
        text += f"{i}. ID {uid} — уровень {level} (опыт {xp})\n"
    await update.message.reply_text(text, parse_mode="Markdown")

async def admin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await admin_panel(update, context)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📋 **Команды:**\n"
        "/start – начать работу\n"
        "/pet – состояние питомца (с анимацией)\n"
        "/feed – покормить питомца\n"
        "/petting – погладить питомца\n"
        "/play – сыграть в игру\n"
        "/daily – ежедневный бонус\n"
        "/schedule – расписание на сегодня\n"
        "/set_calendar <ссылка> – загрузить расписание из iCal\n"
        "/add_lesson – добавить пару вручную (для теста)\n"
        "/top – топ пользователей по уровню\n"
        "/admin – админ-панель (только для администратора)\n"
        "/help – эта справка"
    )

async def unknown_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("❌ Неизвестная команда. Используйте /help")
