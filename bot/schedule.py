import httpx
from datetime import datetime
from config import BACKEND_URL
from auth import get_token_for_user

async def get_schedule(telegram_id: int) -> list | None:
    """Возвращает расписание пользователя (список с полями date, time, name, place)"""
    token = await get_token_for_user(telegram_id)
    if not token:
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"Authorization": f"Bearer {token}"}
            resp = await client.get(f"{BACKEND_URL}/api/schedule", headers=headers)
            if resp.status_code == 200:
                return resp.json()
            else:
                print(f"Ошибка /schedule: {resp.status_code}")
                return None
    except Exception as e:
        print(f"Ошибка соединения: {e}")
        return None
