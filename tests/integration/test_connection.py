import asyncio
import asyncpg
import pytest
from dotenv import load_dotenv
import os

# Загружаем переменные окружения из .env
load_dotenv()

# Получаем параметры подключения из .env
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "postgres")


@pytest.mark.asyncio
async def test_db_connection():
    """Проверяем подключение к базе данных."""
    try:
        conn = await asyncpg.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
        )
        version = await conn.fetchval("SELECT version();")

        assert version, "Не удалось получить версию базы данных и подтвердить соединение"
        await conn.close()
    except Exception as e:
        pytest.fail(f"Ошибка подключения к базе данных: {str(e)}")


if __name__ == "__main__":
    asyncio.run(test_db_connection())
