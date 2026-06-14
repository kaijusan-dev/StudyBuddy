import os
from dotenv import load_dotenv

load_dotenv('.env.bot')

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not TELEGRAM_TOKEN:
    TELEGRAM_TOKEN = "Ваш токен"

ADMIN_IDS = [int(x.strip()) for x in os.getenv("ADMIN_IDS", "").split(",") if x.strip()]
