import httpx
from config import BACKEND_URL

user_tokens = {}

async def authorize_user(telegram_id: int):
    """Получает токен для пользователя по tg_id (необязательно)"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{BACKEND_URL}/api/login",
                params={"tg_id": telegram_id}
            )
            if response.status_code == 200:
                data = response.json()
                token = data.get("token")
                if token:
                    user_tokens[telegram_id] = token
                    return token
    except Exception:
        pass
    return None