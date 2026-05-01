import json
from datetime import datetime
from config import PET_DATA_FILE
from utils import get_mood, get_progress_bar

def load_pet_data():
    """Load pet data from file"""
    if PET_DATA_FILE.exists():
        with open(PET_DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_pet_data(data):
    """Save pet data to file"""
    with open(PET_DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_default_pet():
    """Return default pet"""
    return {
        "name": "Pitomets",
        "level": 1,
        "fullness": 80,
        "happiness": 80,
        "energy": 80,
        "last_fed": None,
        "created_at": datetime.now().isoformat()
    }

async def get_pet_info(telegram_id: int):
    """Get pet info for user"""
    pet_data = load_pet_data()
    user_id = str(telegram_id)
    
    if user_id not in pet_data:
        pet_data[user_id] = get_default_pet()
        save_pet_data(pet_data)
    
    pet = pet_data[user_id]
    
    return {
        "name": pet.get("name", "Pitomets"),
        "level": pet.get("level", 1),
        "fullness": pet.get("fullness", 80),
        "happiness": pet.get("happiness", 80),
        "energy": pet.get("energy", 80),
        "mood": get_mood(pet.get("fullness", 80), pet.get("happiness", 80)),
        "fullness_bar": get_progress_bar(pet.get("fullness", 80)),
        "happiness_bar": get_progress_bar(pet.get("happiness", 80)),
        "last_fed": pet.get("last_fed")
    }

async def feed_pet(telegram_id: int) -> dict:
    """Feed the pet"""
    pet_data = load_pet_data()
    user_id = str(telegram_id)
    
    if user_id not in pet_data:
        pet_data[user_id] = get_default_pet()
    
    pet = pet_data[user_id]
    old_fullness = pet.get("fullness", 80)
    new_fullness = min(100, old_fullness + 20)
    pet["fullness"] = new_fullness
    
    old_happiness = pet.get("happiness", 80)
    new_happiness = min(100, old_happiness + 5)
    pet["happiness"] = new_happiness
    
    pet["last_fed"] = datetime.now().isoformat()
    
    save_pet_data(pet_data)
    
    return {
        "old_fullness": old_fullness,
        "new_fullness": new_fullness,
        "happiness": new_happiness
    }

async def delete_pet(telegram_id: int) -> bool:
    """Delete user's pet"""
    pet_data = load_pet_data()
    user_id = str(telegram_id)
    
    if user_id in pet_data:
        del pet_data[user_id]
        save_pet_data(pet_data)
        return True
    return False

async def add_happiness(telegram_id: int, amount: int) -> int:
    """Add happiness to pet"""
    pet_data = load_pet_data()
    user_id = str(telegram_id)
    
    if user_id not in pet_data:
        pet_data[user_id] = get_default_pet()
    
    pet = pet_data[user_id]
    old_happiness = pet.get("happiness", 80)
    new_happiness = min(100, old_happiness + amount)
    pet["happiness"] = new_happiness
    save_pet_data(pet_data)
    
    return new_happiness