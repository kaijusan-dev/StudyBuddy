import asyncio
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters

from config import TELEGRAM_TOKEN
from handlers import (
    start, pet_command, feed_command, delete_pet_command,
    quote, weather_command, cities_menu, city_callback,
    help_command, delete_pet_callback,
    schedule_command, schedule_edit, add_lesson_command,
    schedule_callback, handle_text_input,
    # Новые импорты для календаря
    set_calendar_url, sync_calendar, show_calendar_url
)
from games import rps_start, rps_callback
from schedule import load_schedules, start_scheduler

def main():
    # Загружаем расписания из файла
    load_schedules()
    
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    
    # Команды питомца
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("pet", pet_command))
    app.add_handler(CommandHandler("feed", feed_command))
    app.add_handler(CommandHandler("delete_pet", delete_pet_command))
    
    # Команды развлечений
    app.add_handler(CommandHandler("quote", quote))
    app.add_handler(CommandHandler("weather", weather_command))
    app.add_handler(CommandHandler("cities", cities_menu))
    app.add_handler(CommandHandler("rps", rps_start))
    app.add_handler(CommandHandler("help", help_command))
    
    # Команды расписания
    app.add_handler(CommandHandler("schedule", schedule_command))
    app.add_handler(CommandHandler("schedule_edit", schedule_edit))
    app.add_handler(CommandHandler("add_lesson", add_lesson_command))
    app.add_handler(CommandHandler("cancel", lambda u, c: u.message.reply_text("❌ Отменено")))
    
    # Команды календаря
    app.add_handler(CommandHandler("set_calendar", set_calendar_url))
    app.add_handler(CommandHandler("sync_calendar", sync_calendar))
    app.add_handler(CommandHandler("show_calendar", show_calendar_url))
    
    # Callback-запросы
    app.add_handler(CallbackQueryHandler(city_callback, pattern="^city_"))
    app.add_handler(CallbackQueryHandler(rps_callback, pattern="^rps_"))
    app.add_handler(CallbackQueryHandler(delete_pet_callback, pattern="confirm_delete"))
    app.add_handler(CallbackQueryHandler(delete_pet_callback, pattern="cancel_delete"))
    app.add_handler(CallbackQueryHandler(schedule_callback, pattern="^schedule_"))
    
    # Обработка текста (для добавления пары вручную)
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text_input))
    
    # Запускаем планировщик уведомлений
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.create_task(start_scheduler(app))
    
    print("✅ Бот запущен!")
    app.run_polling()

if __name__ == "__main__":
    main()