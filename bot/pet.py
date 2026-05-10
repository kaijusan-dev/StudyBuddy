import httpx
from config import BACKEND_URL
from auth import get_token_for_user

async def get_pet(telegram_id: int):
    token = await get_token_for_user(telegram_id)
    if not token:
        print("get_pet: no token")
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"Authorization": f"Bearer {token}"}
            resp = await client.get(f"{BACKEND_URL}/api/pet", headers=headers)
            if resp.status_code == 200:
                return resp.json()
            else:
                print(f"get_pet error: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"get_pet exception: {e}")
    return None

async def feed_pet(telegram_id: int):
    token = await get_token_for_user(telegram_id)
    if not token:
        print("feed_pet: no token")
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            resp = await client.post(f"{BACKEND_URL}/api/pet/feed", headers=headers)
            if resp.status_code == 200:
                return resp.json()
            else:
                print(f"feed_pet error: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"feed_pet exception: {e}")
    return None

async def play_pet(telegram_id: int, result: str):
    token = await get_token_for_user(telegram_id)
    if not token:
        print("play_pet: no token")
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            resp = await client.post(f"{BACKEND_URL}/api/pet/play", json={"result": result}, headers=headers)
            if resp.status_code == 200:
                return resp.json()
            else:
                print(f"play_pet error: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"play_pet exception: {e}")
    return None

async def daily_bonus(telegram_id: int):
    token = await get_token_for_user(telegram_id)
    if not token:
        print("daily_bonus: no token")
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"Authorization": f"Bearer {token}"}
            resp = await client.post(f"{BACKEND_URL}/api/pet/daily", headers=headers)
            if resp.status_code == 200:
                return resp.json()
            else:
                print(f"daily_bonus error: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"daily_bonus exception: {e}")
    return None

async def heal_pet(telegram_id: int):
    token = await get_token_for_user(telegram_id)
    if not token:
        print("heal_pet: no token")
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            headers = {"Authorization": f"Bearer {token}"}
            resp = await client.post(f"{BACKEND_URL}/api/pet/heal", headers=headers)
            if resp.status_code == 200:
                return resp.json()
            else:
                print(f"heal_pet error: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"heal_pet exception: {e}")
    return None
