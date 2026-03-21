# StudyBuddy

**StudyBuddy** — это веб-приложение «Тамагочи для студентов», которое помогает отслеживать расписание, посещаемость и дедлайны, а также заботиться о виртуальном питомце.

## Стек технологий

- **Frontend:** React + Vite  
- **Backend:** Node.js + Express  
- **Database:** PostgreSQL  
- **DevOps:** Docker + Docker Compose  
- **Дополнительно:** Telegram Bot на Python
- **WebSocket:** для взаимодействия с питомцем в реальном времени  

## Настройка проекта

Проект использует единый `.env` для всех сред.  
Файл `.env.example` можно скопировать в `.env` и настроить переменные.

## Запуск проекта

### Локально через Docker

#### Dev

Собрать и запустить контейнеры с пересборкой (или без пересборки без флага `--build`):
```bash
docker-compose -f docker-compose-dev.yaml up --build
``` 

**Контейнеры:**
- frontend: http://localhost:5173
- backend: http://localhost:3000
- db: порт 5432

Сайт доступен по адресу: http://localhost:5173/

#### Prod

Собрать и запустить контейнеры с пересборкой (или без пересборки без флага --build):
```bash
docker-compose -f docker-compose-prod.yaml up --build
```

Использовать свой домен / в моем случае ngrok для доступа к локальному веб-серверу (localhost) из интернета через публичный URL:
```bash
ngrok http 3000
```

**Контейнеры:**
- app: http://backend:3000
- db: порт 5432

Сайт доступен по адресу: https://ваш-домен/ 

## Команды Docker

```bash
# пересобрать и запустить все контейнеры
docker-compose -f docker-compose-dev.yaml up --build 
или
docker-compose -f docker-compose-prod.yaml up --build 

# остановить и удалить контейнеры
docker-compose -f docker-compose-dev.yaml down
или
docker-compose -f docker-compose-prod.yaml down

# посмотреть логи конкретного контейнера
docker logs -f studybuddy_backend

# войти внутрь контейнера
docker exec -it studybuddy_backend bash
```

##  Архитектура приложения

StudyBuddy построен по классической клиент-серверной архитектуре с REST API + WebSocket для питомца.

### 1. Frontend

- **Технологии:** React + Vite
- **Основные задачи:**
  - Отображение UI
  - Обработка действий пользователя
  - HTTP-запросы к Backend
  - Подключение WebSocket для питомца

Frontend отвечает только за интерфейс и взаимодействие с API/WebSocket.

### 2. Backend

- **Технологии:** Node.js + Express
- **Основные задачи:**
  - Обработка HTTP-запросов
  - Проверка и валидация данных
  - Бизнес-логика приложения
  - Формирование JSON-ответов
  - Управление состоянием
  - WebSocket сервер для питомца
  - Работа с PostgreSQL

Backend - центральный уровень логики приложения.

### 3. WebSocket (Pet Socket)

Адрес: ws://backend:3000/ws (для Docker сети)
Передача состояния питомца в реальном времени

- **События:**
  - pet_state — текущее состояние
  - pet_update — обновление (например, кормление)
  - token_expired — токен устарел, закрытие сокет

Взаимодействие с frontend реализовано через хук usePetSocket.

## Модель взаимодействия

Последовательность работы:

1. Пользователь выполняет действие в браузере или Telegram боте
2. Frontend / bot отправляет HTTP-запрос на Backend
3. Backend обрабатывает запрос и обновляет базу данных / состояние питомца
4. Backend возвращает JSON-ответ
5. Frontend / bot обновляет интерфейс

Для питомца используется WebSocket — данные обновляются в реальном времени.