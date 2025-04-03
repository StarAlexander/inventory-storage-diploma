from multiprocessing import Process
from httpx import ASGITransport, AsyncClient
import pytest_asyncio
import uvicorn
from asgi_lifespan import LifespanManager
import pytest
import asyncio








@pytest_asyncio.fixture(scope="function")
async def client():
    async with AsyncClient(base_url="http://localhost:8000") as c:
        yield c


"""
engine = create_async_engine(url=URL.create(
    drivername="mysql+aiomysql",
    host="localhost",
    username=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    port=3306,
    database=os.getenv("DB_TEST_NAME")
),
echo=True,
future=True)

AsyncSessionLocal = async_sessionmaker(bind=engine,expire_on_commit=False)

@pytest_asyncio.fixture(scope="function")
async def async_session():
    async with AsyncSessionLocal() as session:
        await session.begin()
        try:
            yield session
        
        except Exception as e:
            print(e)
            await session.rollback()
            raise
        finally:
            await session.close()
"""




"""

engine = create_async_engine(
    URL.create(
        username="root",
        drivername="mysql+aiomysql",
        host="localhost",
        password="Sashalife20050709",
        port=3306
    ),
    echo=True,
    future=True
)


@pytest_asyncio.fixture(scope="session")
async def mysql_engine():
    async with engine.begin() as conn:
        await conn.execute(text(f"DROP DATABASE IF EXISTS {os.getenv("DB_TEST_NAME")}"))
        await conn.execute(text(f"CREATE DATABASE {os.getenv("DB_TEST_NAME")}"))
        await conn.commit()
    
    s_engine = create_async_engine(
        URL.create(
        username="root",
        drivername="mysql+aiomysql",
        host="localhost",
        password="Sashalife20050709",
        port=3306,
        database=os.getenv("DB_TEST_NAME")
    ),
        echo=True,
        future=True
    )
    async with s_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield s_engine

    async with s_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def test_db(mysql_engine:AsyncEngine):
    async_session = async_sessionmaker(bind=mysql_engine,expire_on_commit=False)
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.rollback()

@pytest.fixture(scope="session", autouse=True)
def start_server():
    proc = Process(target=uvicorn.run, args=("src.main:app",), kwargs={"port": 8000, "log_level": "debug"})
    proc.start()
    yield
    proc.terminate()
    proc.join()

@pytest_asyncio.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


"""

