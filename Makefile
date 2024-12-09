# Определение переменных
PYTHON = python3
PIP = pip
DOCKER_COMPOSE = docker-compose

# Установка зависимостей
install:
	$(PIP) install -r requirements/dev.txt

# Запуск миграций базы данных
migrate:
	alembic upgrade head

# Запуск сервера FastAPI
run:
	uvicorn src.main:app

# Запуск тестов
test:
	pytest --maxfail=1 --disable-warnings -q

# Запуск проекта через Docker Compose
docker-up:
	$(DOCKER_COMPOSE) up --build

# Остановка Docker контейнеров
docker-down:
	$(DOCKER_COMPOSE) down

# Очистка контейнеров, томов и сетей Docker
docker-clean:
	$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans


