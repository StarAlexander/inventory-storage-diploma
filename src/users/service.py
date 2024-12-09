import logging

from fastapi import HTTPException
from .schemas import UserCreate
from .models import User
from .repository import UserRepository
from src.database import SessionLocal

logger = logging.getLogger('app')

class UserService:
    @staticmethod
    async def create_admin_user() -> User:
        async with SessionLocal() as session:
            repo = UserRepository(session)
            admin_user = await repo.create_admin_user()
            if not admin_user:
                logger.info("Пользователь admin уже существует.")
            else:
                logger.info("Пользователь admin успешно создан.")
            return admin_user


    @staticmethod
    async def create_user(user_create: UserCreate) -> User:
        logger.info(f"Попытка создать пользователя с параметрами: {user_create.dict()}")
        async with SessionLocal() as session:
            repo = UserRepository(session)
            existing_user = await repo.get_user_by_username(user_create.username)
            if existing_user:
                raise HTTPException(status_code=400, detail="Username already taken")

            user = User(username=user_create.username)
            user.set_password(user_create.password)
            await repo.create_user(user)
            logger.info(f"Пользователь {user.username} успешно создан.")
            return user
