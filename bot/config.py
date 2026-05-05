import os
from dotenv import load_dotenv

load_dotenv('.env.bot')

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not TELEGRAM_TOKEN:
    TELEGRAM_TOKEN = ""

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
