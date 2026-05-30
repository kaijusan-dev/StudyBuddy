import asyncio
from datetime import datetime
from telegram.ext import Application, CommandHandler
from config import TELEGRAM_TOKEN
from handlers import (
    start, pet_command, feed_command, play_command,
    daily_command, heal_command, schedule_command,
    quote, help_command, active_users
)
from schedule import check_and_send_notifications, send_morning_schedule

async def scheduler(bot):
    while True:
        now = datetime.now()
        # Утренняя рассылка в 7:00
        if now.hour == 7 and now.minute == 0:
            for uid in list(active_users):
                await send_morning_schedule(bot, uid)
            await asyncio.sleep(60)
        else:
            for uid in list(active_users):
                await check_and_send_notifications(bot, uid)
            await asyncio.sleep(60)

def main():
    app = Application.builder().token(TELEGRAM_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("pet", pet_command))
    app.add_handler(CommandHandler("feed", feed_command))
    app.add_handler(CommandHandler("play", play_command))
    app.add_handler(CommandHandler("daily", daily_command))
    app.add_handler(CommandHandler("heal", heal_command))
    app.add_handler(CommandHandler("schedule", schedule_command))
    app.add_handler(CommandHandler("quote", quote))
    app.add_handler(CommandHandler("help", help_command))

    # Запуск планировщика уведомлений
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.create_task(scheduler(app.bot))

    print("✅ Бот запущен (с уведомлениями о парах)")
    app.run_polling()

if __name__ == "__main__":
    main()
