import httpx
from config import BACKEND_URL

user_tokens = {}

async def get_token_for_user(telegram_id: int):
    if telegram_id in user_tokens:
        print(f"Using cached token for {telegram_id}")
        return user_tokens[telegram_id]
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{BACKEND_URL}/api/auth/login/telegram",
                json={"telegram_id": telegram_id}
            )
            if resp.status_code == 200:
                data = resp.json()
                token = data.get("token")
                if token:
                    user_tokens[telegram_id] = token
                    print(f"Got new token for {telegram_id}: {token[:20]}...")
                    return token
            else:
                print(f"Auth error: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"Auth exception: {e}")
    return None
