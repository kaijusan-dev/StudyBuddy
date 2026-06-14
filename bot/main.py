import asyncio
from datetime import datetime
from telegram.ext import Application, CommandHandler, MessageHandler, filters
from config import TELEGRAM_TOKEN
from handlers import (
    start, pet_command, feed_command, petting_command, play_command, daily_command,
    schedule_command, set_calendar_command, add_lesson_command,
    admin_command, help_command, unknown_command, active_users, top_command
)
from admin import (
    stats, listusers, broadcast, resetpet,
    setxp, setlevel, setstats,
    setfullness, sethappiness, setenergy
)
from schedule import check_and_send_notifications, send_morning_schedule
from db import init_db

async def scheduler(bot):
    while True:
        now = datetime.now()
        if now.hour == 7 and now.minute == 0:
            for uid in list(active_users):
                await send_morning_schedule(bot, uid)
            await asyncio.sleep(60)
        else:
            for uid in list(active_users):
                await check_and_send_notifications(bot, uid)
            await asyncio.sleep(60)

def main():
    # Инициализация базы данных (создаёт таблицы)
    init_db()

    app = Application.builder().token(TELEGRAM_TOKEN).build()

    # Основные команды
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("pet", pet_command))
    app.add_handler(CommandHandler("feed", feed_command))
    app.add_handler(CommandHandler("petting", petting_command))
    app.add_handler(CommandHandler("play", play_command))
    app.add_handler(CommandHandler("daily", daily_command))
    app.add_handler(CommandHandler("schedule", schedule_command))
    app.add_handler(CommandHandler("set_calendar", set_calendar_command))
    app.add_handler(CommandHandler("add_lesson", add_lesson_command))
    app.add_handler(CommandHandler("admin", admin_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("top", top_command))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, unknown_command))

    # Админ-команды
    app.add_handler(CommandHandler("stats", stats))
    app.add_handler(CommandHandler("listusers", listusers))
    app.add_handler(CommandHandler("broadcast", broadcast))
    app.add_handler(CommandHandler("resetpet", resetpet))
    app.add_handler(CommandHandler("setxp", setxp))
    app.add_handler(CommandHandler("setlevel", setlevel))
    app.add_handler(CommandHandler("setstats", setstats))
    app.add_handler(CommandHandler("setfullness", setfullness))
    app.add_handler(CommandHandler("sethappiness", sethappiness))
    app.add_handler(CommandHandler("setenergy", setenergy))

    # Запуск планировщика уведомлений
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.create_task(scheduler(app.bot))

    print("✅ Бот запущен. База данных SQLite.")
    app.run_polling()

if __name__ == "__main__":
    main()
