from telegram import Update
from telegram.ext import ContextTypes
from auth import get_token_for_user
from pet import get_pet, feed_pet, play_pet, daily_bonus, heal_pet
from schedule import get_schedule
from datetime import datetime
import random

QUOTES = [
    "Цитата 1: Всё получится!",
    "Цитата 2: Код – это поэзия.",
    "Цитата 3: Лучше сегодня, чем завтра."
]

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    token = await get_token_for_user(user.id)
    if token:
        await update.message.reply_text(f"Hello {user.first_name}! Account linked.")
    else:
        await update.message.reply_text(f"Hello {user.first_name}! Cannot get token. Check backend.")

async def pet_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    pet = await get_pet(update.effective_user.id)
    if not pet:
        await update.message.reply_text("Can't get pet data.")
        return
    fullness = pet.get("fullness", 0)
    happiness = pet.get("happiness", 0)
    energy = pet.get("energy", 0)
    level = pet.get("level", 1)
    xp = pet.get("xp", 0)
    coins = pet.get("coins", 0)

    text = (
        f"🐾 **Питомец**\n"
        f"⭐ Уровень: {level}\n"
        f"📊 Опыт: {xp}\n"
        f"🪙 Монеты: {coins}\n\n"
        f"🍔 Сытость: {fullness}%\n"
        f"😊 Счастье: {happiness}%\n"
        f"⚡ Энергия: {energy}%\n"
    )
    await update.message.reply_text(text, parse_mode="Markdown")

async def feed_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    result = await feed_pet(update.effective_user.id)
    if result:
        await update.message.reply_text(
            f"🍽️ Покормлен! Сытость: {result['fullness']}%, Счастье: {result['happiness']}%, Опыт: {result['xp']}"
        )
    else:
        await update.message.reply_text("❌ Ошибка кормления.")

async def play_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Простейшая имитация игры – случайный результат
    outcomes = ['win', 'lose', 'draw']
    result = random.choice(outcomes)
    updated = await play_pet(update.effective_user.id, result)
    if updated:
        await update.message.reply_text(
            f"🎮 Результат: {result.upper()}!\n"
            f"❤️ Счастье: {updated['happiness']}%, "
            f"💰 Монеты: {updated['coins']}, "
            f"✨ Опыт: {updated['xp']}"
        )
    else:
        await update.message.reply_text("❌ Ошибка игры.")

async def daily_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    result = await daily_bonus(update.effective_user.id)
    if result and "error" not in result:
        await update.message.reply_text(
            f"🎁 Ежедневный бонус получен!\nМонеты: +10, Опыт: +10, Счастье: +10.\n"
            f"Теперь у тебя {result.get('coins', '?')} монет, {result.get('xp', '?')} опыта."
        )
    else:
        await update.message.reply_text("❌ Бонус уже получен сегодня или ошибка.")

async def heal_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    result = await heal_pet(update.effective_user.id)
    if result and "error" not in result:
        await update.message.reply_text(
            f"💊 Питомец вылечен!\nСчастье: {result['happiness']}%, Энергия: {result['energy']}%\n"
            f"Осталось монет: {result['coins']}"
        )
    else:
        await update.message.reply_text("❌ Недостаточно монет (нужно 200) или ошибка.")

async def schedule_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    data = await get_schedule(update.effective_user.id)
    if not data or not isinstance(data, list):
        await update.message.reply_text("Нет данных расписания.")
        return
    today = datetime.now().date().isoformat()
    today_events = []
    for ev in data:
        start_time = ev.get("start_time")
        if start_time:
            event_date = start_time[:10]
            if event_date == today:
                time_part = start_time[11:16]
                today_events.append({
                    "time": time_part,
                    "name": ev.get("summary", "Без названия")
                })
    if not today_events:
        await update.message.reply_text("На сегодня пар нет.")
        return
    today_events.sort(key=lambda e: e["time"])
    text = "📅 **Расписание на сегодня:**\n\n"
    for e in today_events:
        text += f"⏰ {e['time']} – {e['name']}\n"
    await update.message.reply_text(text, parse_mode="Markdown")

async def quote(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(random.choice(QUOTES))
