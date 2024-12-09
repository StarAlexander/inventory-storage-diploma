from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = (f"postgresql+asyncpg://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:"
          f"{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}")

engine = create_async_engine(DB_URL, future=True)
Base = declarative_base()
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def create_all_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db() -> AsyncSession:
    async with SessionLocal() as session:
        yield session
