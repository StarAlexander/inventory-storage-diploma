from multiprocessing import Process

import pytest
import uvicorn

from src.database import SessionLocal
from fastapi.testclient import TestClient
from src.main import app

@pytest.fixture(scope="function")
def client():
    return TestClient(app=app)

@pytest.fixture
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