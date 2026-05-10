import random

QUOTES = [
    "Всё получится!", "Учись, играя!", "Питомец ждёт твоей заботы.",
    "Программирование — это весело!", "Хорошего дня!"
]

def get_random_quote():
    return random.choice(QUOTES)
