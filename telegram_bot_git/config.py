import os
from pathlib import Path
from dotenv import load_dotenv

# Загружаем переменные из .env.bot (файл должен лежать рядом с main.py)
load_dotenv('.env.bot')

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not TELEGRAM_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN not found in .env.bot")

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
PET_DATA_FILE = Path("pet_data.json")
SCHEDULE_DATA_FILE = Path("schedule_data.json")