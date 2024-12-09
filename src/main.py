import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from datetime import datetime

from src.exceptions import AdminAlreadyExistsError
from src.database import engine
from src.users import UserService, users_router

import logging.config
from logging.config import fileConfig

load_dotenv()

logging_config_path = os.path.join(os.path.dirname(__file__), '../logging.ini')
if not os.path.exists(logging_config_path):
    raise FileNotFoundError(f"Logging config not found: {logging_config_path}")
fileConfig(logging_config_path)

logger = logging.getLogger('app')

async def lifespan(app):
    try:
        await UserService.create_admin_user()
    except AdminAlreadyExistsError as e:
        logger.warning(f"Администратор уже существует: {e}")
    except Exception as e:
        logger.error(f"Неожиданная ошибка при создании администратора: {e}")
    yield
    logger.info("Сервер останавливается...")
    await engine.dispose()

app = FastAPI(lifespan=lifespan)

app.include_router(users_router)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    logger.info(f"Начало обработки: {request.method} {request.url} at {start_time}")

    if request.method in ["POST", "PUT", "PATCH"]:
        body = await request.body()
        logger.info(f"Тело запроса: {body.decode('utf-8')}")

    response = await call_next(request)

    duration = (datetime.now() - start_time).total_seconds()
    logger.info(f"Ответ для {request.method} {request.url} с кодом {response.status_code} "
                f"за {duration:.3f} секунд.")

    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, lifespan="on")