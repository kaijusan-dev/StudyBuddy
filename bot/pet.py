import httpx
from config import BACKEND_URL
from auth import get_token_for_user

async def get_pet(telegram_id: int) -> dict | None:
    token = await get_token_for_user(telegram_id)
    if not token:
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"Authorization": f"Bearer {token}"}
            resp = await client.get(f"{BACKEND_URL}/api/pet", headers=headers)
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        print(f"Ошибка /pet: {e}")
    return None

async def update_pet(telegram_id: int, action: str, result: str = None) -> dict | None:
    token = await get_token_for_user(telegram_id)
    if not token:
        return None
    payload = {"action": action}
    if result:
        payload["result"] = result
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            resp = await client.post(f"{BACKEND_URL}/api/pet/update", json=payload, headers=headers)
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        print(f"Ошибка /pet/update: {e}")
    return None
