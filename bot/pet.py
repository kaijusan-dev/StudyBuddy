import random
from datetime import datetime, timedelta
from db import get_connection

# ------------------- БАЛАНСНЫЕ КОЭФФИЦИЕНТЫ (PET_BALANCE) -------------------
PET_BALANCE = {
    "FULLNESS": {
        "MAX": 30,
        "ZONES": {"HUNGRY": [0, 9], "NORMAL": [10, 19], "FULL": [20, 30]},
        "DECAY_PER_DAY": lambda level: 4 if level < 10 else (3 if level < 20 else 2),
        "PROTECTION_DAYS": 2,
        "PER_LESSON": 2,
    },
    "ENERGY": {
        "MAX": 100,
        "PER_LEVEL_BONUS": 0.02,
        "RECOVERY_PER_HOUR": 2,
        "NIGHT_RECOVERY_PER_HOUR": 4,
        "MIN_FOR_GAME": 5,
        "RPS_COST": 5,
        "FEED_COST": 3,
        "PER_LESSON": 10,
    },
    "HAPPINESS": {
        "MAX": 100,
        "PER_LEVEL_BONUS_PERCENT": 0.01,
        "DECAY_PER_DAY": 2,
    },
    "XP": {
        "LESSON": 15,
        "RPS_WIN": 5,
        "RPS_LOSS": 1,
        "RPS_DRAW": 2,
        "FEED": 3,
        "DAILY": 5,
        "FORMULA": lambda level: round(100 * (1.25 ** (level - 1))),
    },
    "COINS": {
        "STREAK_3_0": 3,
        "DAILY": 1,
        "EXTRA_LESSON": 1,
        "FEED_NORMAL_COST": 5,
        "FEED_HUNGRY_COST": 10,
    },
    "ACTIONS": {
        "FEED": {"fullness": 10, "xp": 3, "feed_count": 1},
        "CARESS": {"happiness": 5, "energy": -5, "xp": 2},
        "PLAY": {"energy": -10, "happiness": 15, "xp": 3},
    },
}

def xp_for_next_level(level: int) -> int:
    return PET_BALANCE["XP"]["FORMULA"](level)

def get_fullness_decay_per_day(level: int) -> int:
    return PET_BALANCE["FULLNESS"]["DECAY_PER_DAY"](level)

def get_energy_cost_for_action(action: str) -> int:
    if action == "play":
        return PET_BALANCE["ENERGY"]["RPS_COST"]
    if action == "feed":
        return PET_BALANCE["ENERGY"]["FEED_COST"]
    if action == "petting":
        return 2  # не указано в PET_BALANCE, оставляем как было
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
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM pets WHERE telegram_id = ?", (telegram_id,)
        ).fetchone()
        if row is None:
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
    last_updated_str = pet.get("last_updated")
    last_updated = datetime.fromisoformat(last_updated_str) if last_updated_str else datetime.now()
    now = datetime.now()
    diff_seconds = (now - last_updated).total_seconds()
    if diff_seconds < 300:
        return pet

    days_passed = diff_seconds / 86400.0
    level = pet["level"]

    # Сытость
    decay_per_day = get_fullness_decay_per_day(level)
    fullness_decay = days_passed * decay_per_day
    pet["fullness"] = max(0, pet["fullness"] - fullness_decay)

    # Счастье
    happiness_decay = days_passed * PET_BALANCE["HAPPINESS"]["DECAY_PER_DAY"]
    pet["happiness"] = max(0, pet["happiness"] - happiness_decay)

    # Энергия (восстановление 2% в час)
    hours_passed = diff_seconds / 3600.0
    energy_recovery = hours_passed * PET_BALANCE["ENERGY"]["RECOVERY_PER_HOUR"]
    pet["energy"] = min(100, pet["energy"] + energy_recovery)

    pet["last_updated"] = now.isoformat()
    with get_connection() as conn:
        conn.execute(
            "UPDATE pets SET fullness=?, happiness=?, energy=?, last_updated=? WHERE telegram_id=?",
            (pet["fullness"], pet["happiness"], pet["energy"], pet["last_updated"], pet["telegram_id"])
        )
        conn.commit()
    return pet

async def update_pet(telegram_id: int, updates: dict):
    with get_connection() as conn:
        set_clause = ", ".join([f"{k} = ?" for k in updates.keys()])
        values = list(updates.values()) + [datetime.now().isoformat(), telegram_id]
        conn.execute(
            f"UPDATE pets SET {set_clause}, last_updated = ? WHERE telegram_id = ?",
            values
        )
        conn.commit()

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

async def add_coins(telegram_id: int, amount: int):
    pet = await get_pet(telegram_id)
    new_coins = pet["coins"] + amount
    await update_pet(telegram_id, {"coins": new_coins})

# ------------------- ДЕЙСТВИЯ -------------------
async def feed_pet(telegram_id: int):
    pet = await get_pet(telegram_id)
    # Проверка: если сытость >= 20, кормить нельзя
    if pet["fullness"] >= 20:
        return None, "❌ Питомец не голоден! Подожди, пока сытость снизится."
    # Проверка энергии
    cost_energy = get_energy_cost_for_action("feed")
    if pet["energy"] < cost_energy:
        return None, "❌ Недостаточно энергии для кормления!"
    # Стоимость в монетах (зависит от зоны голода)
    if pet["fullness"] <= 9:
        cost_coins = PET_BALANCE["COINS"]["FEED_HUNGRY_COST"]  # 10
    else:
        cost_coins = PET_BALANCE["COINS"]["FEED_NORMAL_COST"]  # 5
    if pet["coins"] < cost_coins:
        return None, f"❌ Не хватает монет! Нужно {cost_coins}."

    # Применяем изменения
    pet["energy"] -= cost_energy
    pet["coins"] -= cost_coins
    pet["fullness"] = min(30, pet["fullness"] + PET_BALANCE["ACTIONS"]["FEED"]["fullness"])
    pet["happiness"] = min(100, pet["happiness"] + 5)  # +5 не в PET_BALANCE? Оставим для совместимости с ботом
    pet["feed_count"] = pet.get("feed_count", 0) + 1

    await update_pet(telegram_id, {
        "energy": pet["energy"],
        "coins": pet["coins"],
        "fullness": pet["fullness"],
        "happiness": pet["happiness"],
        "feed_count": pet["feed_count"]
    })
    await add_xp(telegram_id, PET_BALANCE["XP"]["FEED"])
    final_pet = await get_pet(telegram_id)
    return final_pet, None

async def play_pet(telegram_id: int, result: str):
    pet = await get_pet(telegram_id)
    # Проверка: если сытость <= 0, играть нельзя
    if pet["fullness"] <= 0:
        return None, "❌ Питомец слишком голоден для игр! Сначала покорми."
    # Проверка энергии
    cost_energy = get_energy_cost_for_action("play")
    if pet["energy"] < cost_energy:
        return None, "❌ Недостаточно энергии для игры!"

    # Применяем действие PLAY
    pet["energy"] -= cost_energy
    # Дополнительная трата из баланса (в PET_BALANCE.ACTIONS.PLAY энергия -10, а cost уже 5, нужно вычесть ещё 5)
    pet["energy"] = max(0, pet["energy"] - 5)

    if result == 'win':
        pet["happiness"] = min(100, pet["happiness"] + PET_BALANCE["ACTIONS"]["PLAY"]["happiness"])
        await add_xp(telegram_id, PET_BALANCE["XP"]["RPS_WIN"])
        await add_coins(telegram_id, PET_BALANCE["COINS"]["STREAK_3_0"])
    elif result == 'lose':
        pet["happiness"] = max(0, pet["happiness"] - 5)  # штраф за поражение (не в PET_BALANCE, но оставим)
        await add_xp(telegram_id, PET_BALANCE["XP"]["RPS_LOSS"])
    else:  # draw
        await add_xp(telegram_id, PET_BALANCE["XP"]["RPS_DRAW"])

    await update_pet(telegram_id, {"energy": pet["energy"], "happiness": pet["happiness"]})
    final_pet = await get_pet(telegram_id)
    return final_pet, None

async def petting_pet(telegram_id: int):
    pet = await get_pet(telegram_id)
    if pet["fullness"] <= 0:
        return None, "❌ Питомец слишком голоден для игр! Сначала покорми."
    cost_energy = get_energy_cost_for_action("petting")
    if pet["energy"] < cost_energy:
        return None, "❌ Недостаточно энергии для поглаживания!"

    pet["energy"] -= cost_energy
    pet["happiness"] = min(100, pet["happiness"] + PET_BALANCE["ACTIONS"]["CARESS"]["happiness"])
    # Дополнительная трата энергии из CARESS (уже учтена? в CARESS energy = -5, а cost уже 2, вычтем ещё 3)
    pet["energy"] = max(0, pet["energy"] - 3)

    await update_pet(telegram_id, {"energy": pet["energy"], "happiness": pet["happiness"]})
    await add_xp(telegram_id, PET_BALANCE["XP"]["FEED"])  # CARESS даёт 2 XP, но в PET_BALANCE не указано; оставим 2
    final_pet = await get_pet(telegram_id)
    return final_pet, None

async def daily_bonus(telegram_id: int):
    pet = await get_pet(telegram_id)
    today = datetime.now().date().isoformat()
    if pet.get("last_daily") == today:
        return None, "❌ Бонус уже получен сегодня."
    pet["last_daily"] = today
    pet["fullness"] = min(30, pet["fullness"] + 10)
    pet["happiness"] = min(100, pet["happiness"] + 5)
    pet["coins"] += PET_BALANCE["COINS"]["DAILY"]
    await add_xp(telegram_id, PET_BALANCE["XP"]["DAILY"])
    await update_pet(telegram_id, {
        "last_daily": pet["last_daily"],
        "fullness": pet["fullness"],
        "happiness": pet["happiness"],
        "coins": pet["coins"]
    })
    final_pet = await get_pet(telegram_id)
    return final_pet, None
