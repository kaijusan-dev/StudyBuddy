import requests

POPULAR_CITIES = ["Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань", "Краснодар"]

def get_weather(city: str) -> str | None:
    """Возвращает строку с погодой или None"""
    try:
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=ru&format=json"
        geo_response = requests.get(geo_url, timeout=10)
        geo_data = geo_response.json()
        if not geo_data.get("results"):
            return None
        location = geo_data["results"][0]
        city_name = location["name"]
        country = location.get("country", "")
        lat = location["latitude"]
        lon = location["longitude"]
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&timezone=auto"
        weather_response = requests.get(weather_url, timeout=10)
        weather_data = weather_response.json()
        if "current_weather" not in weather_data:
            return None
        current = weather_data["current_weather"]
        temperature = current["temperature"]
        wind_speed = current["windspeed"]
        weather_code = current.get("weathercode", 0)
        weather_descriptions = {
            0: "Ясное небо ☀️", 1: "Преимущественно ясно 🌤️", 2: "Переменная облачность ⛅",
            3: "Пасмурно ☁️", 45: "Туман 🌫️", 48: "Изморозь 🌫️", 51: "Легкая морось 🌧️",
            61: "Небольшой дождь 🌦️", 80: "Ливень 🌧️", 95: "Гроза ⛈️",
        }
        description = weather_descriptions.get(weather_code, "Специфическая погода 🤔")
        return (f"🌍 Погода в {city_name}, {country}:\n\n"
                f"🌡️ Температура: {temperature}°C\n💨 Ветер: {wind_speed} км/ч\n☁️ {description}\n"
                f"💡 Данные: Open-Meteo")
    except Exception as e:
        print(f"Ошибка погоды: {e}")
        return None