from fastapi import Request
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime

logger = logging.getLogger('app')

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        logger.info(f"Получен запрос: {request.method} {request.url} at {datetime.now()}")

        if request.method in ["POST", "PUT", "PATCH"]:
            body = await request.body()
            logger.info(f"Тело запроса: {body.decode()}")

        response = await call_next(request)
        logger.info(f"Ответ для {request.method} {request.url} с кодом: {response.status_code}")

        return response
