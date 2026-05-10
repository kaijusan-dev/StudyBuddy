from telegram.ext import Application, CommandHandler
from config import TELEGRAM_TOKEN
from handlers import (
    start, pet_command, feed_command, play_command, daily_command,
    heal_command, schedule_command, quote
)

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

    print("✅ Бот запущен")
    app.run_polling()

if __name__ == "__main__":
    main()
