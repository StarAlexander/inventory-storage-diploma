from sqlalchemy import pool
from alembic import context
from dotenv import load_dotenv
import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

# Обновление конфига
load_dotenv()
config = context.config
config.set_main_option(
    "sqlalchemy.url", f"postgresql+asyncpg://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
                      f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

# Для автоматической миграции (пока отсутствует???)
target_metadata = None

async def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    print(f"[Starting]: Using database URL: {url}")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    engine = create_async_engine(config.get_main_option("sqlalchemy.url"), poolclass=pool.NullPool)

    async with engine.connect() as connection:
        await connection.run_sync(context.configure, connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

# Основной процесс миграций
async def main():
    if context.is_offline_mode():
        await run_migrations_offline()
    else:
        await run_migrations_online()

# Запуск миграций в асинхронном режиме
if __name__ == "__main__":
    asyncio.run(main())
