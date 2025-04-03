from contextlib import asynccontextmanager
from typing import AsyncGenerator
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine,async_sessionmaker,AsyncSession
import os
from dotenv import load_dotenv

load_dotenv()
Base = declarative_base()

engine = create_async_engine(
    f"mysql+aiomysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@db:3306/{os.getenv('DB_NAME')}?charset=utf8mb4",
    echo=True,
    future=True
)
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)





@asynccontextmanager
async def get_database() -> AsyncGenerator[AsyncSession,None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()