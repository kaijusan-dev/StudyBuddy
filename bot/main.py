import asyncio
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters
from config import TELEGRAM_TOKEN
from handlers import (start, pet_command, feed_command, play_command, schedule_command,
    quote, weather_command, cities_menu, city_callback,
    help_command, delete_pet_command, delete_pet_callback,
    add_lesson_command, schedule_edit, schedule_callback)
from games import rps_start, rps_callback
from schedule import start_scheduler

def main():
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    # регистрация всех хендлеров (см. ранее)
    # планировщик пока отключён
    app.run_polling()

if __name__ == "__main__":
    main()
