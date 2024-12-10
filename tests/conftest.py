from multiprocessing import Process

import pytest
import uvicorn
import asyncio
import pytest_asyncio
from src.database import SessionLocal
from fastapi.testclient import TestClient
from httpx import AsyncClient
from httpx._transports.asgi import ASGITransport
from src.main import app


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()



@pytest_asyncio.fixture(scope="function")
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport,base_url="http://test") as client:
        yield client

@pytest_asyncio.fixture
async def async_session():
    async with SessionLocal() as session:
        await session.begin()
        try:
            yield session
        finally:
            await session.rollback()

@pytest.fixture(scope="module", autouse=True)
def start_server():
    proc = Process(target=uvicorn.run, args=("src.main:app",), kwargs={"port": 8000, "log_level": "debug"})
    proc.start()
    yield
    proc.terminate()
    proc.join()