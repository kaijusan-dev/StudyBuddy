import random
from datetime import datetime, timedelta
from db import get_connection, init_db

# ------------------- БАЛАНСНЫЕ КОЭФФИЦИЕНТЫ -------------------
def get_fullness_decay_per_day(level: int) -> int:
    if level < 10:
        return 4
    if level < 20:
        return 3
    return 2

def xp_for_next_level(level: int) -> int:
    return round(100 * (1.25 ** (level - 1)))

def get_energy_cost_for_action(action: str) -> int:
    if action == "play":
        return 5
    if action == "feed":
        return 3
    if action == "petting":
        return 2
    return 0

# ------------------- ОПРЕДЕЛЕНИЕ НАСТРОЕНИЯ -------------------
def determine_mood(pet):
    fullness = pet["fullness"]
    happiness = pet["happiness"]
    energy = pet["energy"]

    if fullness <= 0:
        return "dead"
    if fullness <= 9:
        return "hungry"
    if energy < 20:
        return "sleepy"
    if happiness >= 80:
        return "happy"
    if happiness >= 50:
        return "normal"
    return "angry"

def get_mood_gif(mood):
    mapping = {
        "normal": "sprite-animation (5).gif",
        "angry": "sprite-animation (6).gif",
        "happy": "sprite-animation (7).gif",
        "sleepy": "sprite-animation (8).gif",
        "hungry": "sprite-animation (9).gif"
    }
    return mapping.get(mood, "sprite-animation (5).gif")

# ------------------- РАБОТА С БАЗОЙ ДАННЫХ -------------------
async def get_pet(telegram_id: int):
    """Возвращает словарь с данными питомца (создаёт, если нет)"""
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM pets WHERE telegram_id = ?", (telegram_id,)
        ).fetchone()
        if row is None:
            # Создаём нового питомца
            now = datetime.now().isoformat()
            conn.execute(
                """INSERT INTO pets (telegram_id, fullness, happiness, energy,
                                     level, xp, coins, last_updated, last_daily, feed_count)
                   VALUES (?, 30, 70, 80, 1, 0, 0, ?, NULL, 0)""",
                (telegram_id, now)
            )
            conn.commit()
            row = conn.execute(
                "SELECT * FROM pets WHERE telegram_id = ?", (telegram_id,)
            ).fetchone()
        pet = dict(row)
    # Обновляем параметры по времени
    pet = await update_pet_stats(pet)
    return pet

async def update_pet_stats(pet: dict) -> dict:
    """Пересчитывает параметры на основе времени, обновляет БД и возвращает новую запись"""
    last_updated_str = pet.get("last_updated")
    if last_updated_str:
        last_updated = datetime.fromisoformat(last_updated_str)
    else:
        last_updated = datetime.now()
    now = datetime.now()
    diff_seconds = (now - last_updated).total_seconds()
    if diff_seconds < 300:
        return pet

    days_passed = diff_seconds / 86400.0
    level = pet["level"]

    # Сытость (0-30)
    decay_per_day = get_fullness_decay_per_day(level)
    fullness_decay = days_passed * decay_per_day
    pet["fullness"] = max(0, pet["fullness"] - fullness_decay)

    # Счастье (0-100) – падает 2 в день
    happiness_decay = days_passed * 2
    pet["happiness"] = max(0, pet["happiness"] - happiness_decay)

    # Энергия (0-100) – восстанавливается 2 в час
    hours_passed = diff_seconds / 3600.0
    energy_recovery = hours_passed * 2
    pet["energy"] = min(100, pet["energy"] + energy_recovery)

    pet["last_updated"] = now.isoformat()
    # Сохраняем в БД
    with get_connection() as conn:
        conn.execute(
            """UPDATE pets SET fullness=?, happiness=?, energy=?, last_updated=?
               WHERE telegram_id = ?""",
            (pet["fullness"], pet["happiness"], pet["energy"], pet["last_updated"], pet["telegram_id"])
        )
        conn.commit()
    return pet

async def update_pet(telegram_id: int, updates: dict):
    """Обновляет произвольные поля питомца и время last_updated"""
    with get_connection() as conn:
        set_clause = ", ".join([f"{k} = ?" for k in updates.keys()])
        values = list(updates.values()) + [datetime.now().isoformat(), telegram_id]
        conn.execute(
            f"UPDATE pets SET {set_clause}, last_updated = ? WHERE telegram_id = ?",
            values
        )
        conn.commit()
    # Возвращаем обновлённые данные
    return await get_pet(telegram_id)

async def add_xp(telegram_id: int, amount: int):
    pet = await get_pet(telegram_id)
    pet["xp"] += amount
    while True:
        needed = xp_for_next_level(pet["level"])
        if pet["xp"] >= needed:
            pet["xp"] -= needed
            pet["level"] += 1
        else:
            break
    await update_pet(telegram_id, {"xp": pet["xp"], "level": pet["level"]})
    return await get_pet(telegram_id)

async def add_coins(telegram_id: int, amount: int):
    pet = await get_pet(telegram_id)
    new_coins = pet["coins"] + amount
    await update_pet(telegram_id, {"coins": new_coins})
    return await get_pet(telegram_id)

# ------------------- ДЕЙСТВИЯ -------------------
async def feed_pet(telegram_id: int):
    pet = await get_pet(telegram_id)
    cost_energy = get_energy_cost_for_action("feed")
    if pet["energy"] < cost_energy:
        return None, "Недостаточно энергии для кормления!"
    
    pet["energy"] -= cost_energy
    pet["fullness"] = min(30, pet["fullness"] + 10)
    pet["happiness"] = min(100, pet["happiness"] + 5)
    pet["feed_count"] = pet.get("feed_count", 0) + 1
    
    await update_pet(telegram_id, {
        "energy": pet["energy"],
        "fullness": pet["fullness"],
        "happiness": pet["happiness"],
        "feed_count": pet["feed_count"]
    })
    # Добавляем опыт
    await add_xp(telegram_id, 3)
    final_pet = await get_pet(telegram_id)
    return final_pet, None

async def play_pet(telegram_id: int, result: str):
    pet = await get_pet(telegram_id)
    cost_energy = get_energy_cost_for_action("play")
    if pet["energy"] < cost_energy:
        return None, "Недостаточно энергии для игры!"
    pet["energy"] -= cost_energy
    pet["energy"] = max(0, pet["energy"] - 5)  # дополнительные -5 из баланса

    if result == 'win':
        pet["happiness"] = min(100, pet["happiness"] + 15)
        await add_xp(telegram_id, 5)
        await add_coins(telegram_id, 3)
    elif result == 'lose':
        pet["happiness"] = max(0, pet["happiness"] - 5)
        await add_xp(telegram_id, 1)
    else:
        await add_xp(telegram_id, 2)

    await update_pet(telegram_id, {
        "energy": pet["energy"],
        "happiness": pet["happiness"]
    })
    final_pet = await get_pet(telegram_id)
    return final_pet, None

async def petting_pet(telegram_id: int):
    pet = await get_pet(telegram_id)
    cost_energy = get_energy_cost_for_action("petting")
    if pet["energy"] < cost_energy:
        return None, "Недостаточно энергии для поглаживания!"
    pet["energy"] -= cost_energy
    pet["happiness"] = min(100, pet["happiness"] + 5)
    await add_xp(telegram_id, 2)
    await update_pet(telegram_id, {
        "energy": pet["energy"],
        "happiness": pet["happiness"]
    })
    final_pet = await get_pet(telegram_id)
    return final_pet, None

async def daily_bonus(telegram_id: int):
    pet = await get_pet(telegram_id)
    today = datetime.now().date().isoformat()
    if pet.get("last_daily") == today:
        return None, "Бонус уже получен сегодня."
    pet["last_daily"] = today
    pet["fullness"] = min(30, pet["fullness"] + 10)
    pet["happiness"] = min(100, pet["happiness"] + 5)
    pet["coins"] += 1
    await add_xp(telegram_id, 5)
    await update_pet(telegram_id, {
        "last_daily": pet["last_daily"],
        "fullness": pet["fullness"],
        "happiness": pet["happiness"],
        "coins": pet["coins"]
    })
    final_pet = await get_pet(telegram_id)
    return final_pet, None

async def mark_attendance(telegram_id: int):
    pet = await get_pet(telegram_id)
    pet["fullness"] = min(30, pet["fullness"] + 2)
    pet["energy"] = min(100, pet["energy"] + 10)
    await add_xp(telegram_id, 15)
    await update_pet(telegram_id, {
        "fullness": pet["fullness"],
        "energy": pet["energy"]
    })
    return pet
