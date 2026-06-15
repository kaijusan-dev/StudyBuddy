import sqlite3
from pathlib import Path

DB_FILE = Path("bot.db")

def get_connection():
    """Возвращает соединение с БД (row_factory = sqlite3.Row)"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Создаёт таблицы, если их нет"""
    with get_connection() as conn:
        # Таблица питомцев
        conn.execute('''
            CREATE TABLE IF NOT EXISTS pets (
                telegram_id INTEGER PRIMARY KEY,
                fullness REAL DEFAULT 30,
                happiness REAL DEFAULT 70,
                energy REAL DEFAULT 80,
                level INTEGER DEFAULT 1,
                xp INTEGER DEFAULT 0,
                coins INTEGER DEFAULT 0,
                last_updated TEXT,
                last_daily TEXT,
                feed_count INTEGER DEFAULT 0
            )
        ''')
        # Таблица расписания
        conn.execute('''
            CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id INTEGER,
                date TEXT,
                time TEXT,
                name TEXT,
                place TEXT,
                enabled INTEGER DEFAULT 1,
                FOREIGN KEY(telegram_id) REFERENCES pets(telegram_id) ON DELETE CASCADE
            )
        ''')
        # Индекс для быстрой фильтрации по дате и пользователю
        conn.execute('CREATE INDEX IF NOT EXISTS idx_schedule_user_date ON schedule(telegram_id, date)')
        conn.commit()
