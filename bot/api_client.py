import httpx
from config import BACKEND_URL
from auth import authorize_user, get_user_token, set_user_token

async def get_pet_info(telegram_id: int) -> dict | None:
    """Получает данные питомца через API с авторизацией"""
    token = get_user_token(telegram_id)
    if not token:
        token = await authorize_user(telegram_id)
        if not token:
            return None
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{BACKEND_URL}/api/profile",
                headers=headers
            )
            
            if response.status_code == 401:
                token = await authorize_user(telegram_id)
                if token:
                    headers = {"Authorization": f"Bearer {token}"}
                    response = await client.get(
                        f"{BACKEND_URL}/api/profile",
                        headers=headers
                    )
                else:
                    return None
            
            if response.status_code == 200:
                data = response.json()
                pet = data.get("pet") or data.get("pets")
                if pet:
                    if isinstance(pet, list) and len(pet) > 0:
                        pet = pet[0]
                    return {
                        "name": pet.get("name", "Питомец"),
                        "level": pet.get("level", 1),
                        "hunger": pet.get("hunger", pet.get("fullness", 50)),
                        "happiness": pet.get("happiness", 50),
                        "energy": pet.get("energy", 50),
                        "visits_today": pet.get("visits_today", 0)
                    }
            return None
    except Exception as e:
        print(f"Ошибка запроса к API: {e}")
        return None