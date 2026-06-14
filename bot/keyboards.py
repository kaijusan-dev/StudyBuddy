from telegram import InlineKeyboardButton, InlineKeyboardMarkup

def get_rps_keyboard():
    keyboard = [
        [InlineKeyboardButton("🗿 Камень", callback_data="rps_rock"),
         InlineKeyboardButton("✂️ Ножницы", callback_data="rps_scissors"),
         InlineKeyboardButton("📄 Бумага", callback_data="rps_paper")],
        [InlineKeyboardButton("❌ Выйти из игры", callback_data="rps_exit")]
    ]
    return InlineKeyboardMarkup(keyboard)

def get_cities_keyboard(cities):
    keyboard = []
    row = []
    for i, city in enumerate(cities):
        row.append(InlineKeyboardButton(city, callback_data=f"city_{city}"))
        if (i + 1) % 2 == 0 or i == len(cities) - 1:
            keyboard.append(row)
            row = []
    return InlineKeyboardMarkup(keyboard)

def get_delete_pet_keyboard():
    keyboard = [
        [
            InlineKeyboardButton("✅ Да, удалить", callback_data="confirm_delete"),
            InlineKeyboardButton("❌ Нет, оставить", callback_data="cancel_delete")
        ]
    ]
    return InlineKeyboardMarkup(keyboard)

def get_schedule_keyboard(lessons: list):
    """Создаёт клавиатуру для управления расписанием"""
    keyboard = []
    for i, lesson in enumerate(lessons, 1):
        status = "✅" if lesson.get("enabled", True) else "❌"
        keyboard.append([InlineKeyboardButton(
            f"{status} {i}. {lesson['name']} ({lesson['time']})",
            callback_data=f"schedule_toggle_{i}"
        )])
    keyboard.append([InlineKeyboardButton("➕ Добавить пару", callback_data="schedule_add")])
    keyboard.append([InlineKeyboardButton("🗑️ Удалить пару", callback_data="schedule_remove")])
    keyboard.append([InlineKeyboardButton("❌ Закрыть", callback_data="schedule_close")])
    return InlineKeyboardMarkup(keyboard)

def get_schedule_remove_keyboard(lessons: list):
    """Клавиатура для выбора удаляемой пары"""
    keyboard = []
    for i, lesson in enumerate(lessons, 1):
        keyboard.append([InlineKeyboardButton(
            f"{i}. {lesson['name']} ({lesson['time']})",
            callback_data=f"schedule_remove_confirm_{i}"
        )])
    keyboard.append([InlineKeyboardButton("◀️ Назад", callback_data="schedule_back")])
    return InlineKeyboardMarkup(keyboard)