import logging

from fastapi import HTTPException
from .schemas import UserCreate, UserUpdate
from .models import User
from .repository import UserRepository
from src.database import SessionLocal
from src.exceptions import UserNotFoundError
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
        logger.info(f"Попытка создать пользователя с параметрами: {user_create}")
        async with SessionLocal() as session:
            repo = UserRepository(session)
            existing_user = await repo.get_user_by_username(user_create.username)
            if existing_user:
                raise HTTPException(status_code=400, detail="Username already taken")

            user = User(
                username=user_create.username,
                first_name=user_create.first_name,
                last_name=user_create.last_name,
                email=user_create.email,
                middle_name=user_create.middle_name,
                phone=user_create.phone,
                is_system=user_create.is_system,
                hired_at=user_create.hired_at,
                status=True
            )

            user.set_password(user_create.password)
            await repo.create_user(user)
            logger.info(f"Пользователь {user.username} успешно создан.")
            return user
    
    @staticmethod
    async def get_users() -> list[User]:
        # TODO: Реализовать ответ 404, если отсутствуют пользователи
        logger.info(f"Попытка получить пользователей")
        async with SessionLocal() as session:
            repo = UserRepository(session)
            users = await repo.get_users()
            all = users.fetchall()
            if not len(all):
                raise HTTPException(status_code=404,detail="No users found")
            return all


    @staticmethod
    async def get_user_by_username(username:str) -> User:
        logger.info(f"Попытка получить пользователя по username: {username}")
        async with SessionLocal() as session:
            repo = UserRepository(session)
            user = await repo.get_user_by_username(username)
            if not user:
                raise HTTPException(status_code=404, detail="No such user")
            return user
        
    @staticmethod
    async def update_user(user:UserUpdate) -> User:
        logger.info(f"Попытка обновить пользователя")
        try:
            async with SessionLocal() as session:
                repo = UserRepository(session)
                updated = await repo.update_user(user)

                if not updated:
                    raise HTTPException(status_code=500,detail="failed to update")
                return updated
        except UserNotFoundError:
            raise HTTPException(status_code=404, detail="No such user")

    
    @staticmethod
    async def toggle_user(username:str) -> User:
        logger.info(f"Попытка переключить пользователя")
        async with SessionLocal() as session:
            repo = UserRepository(session)
            toggled = await repo.toggle_user(username)
            if not toggled:
                raise HTTPException(status_code=500,detail="failed to toggle")
            return toggled

    @staticmethod
    async def delete_user(username:str):
        logger.info(f"Попытка удалить пользователя: {username}")
        async with SessionLocal() as session:
            repo = UserRepository(session)
            await repo.delete_user(username)
            logger.info(f"Успешно удалён пользователь: {username}")

