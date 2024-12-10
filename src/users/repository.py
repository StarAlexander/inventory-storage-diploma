from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select,update,delete

from .schemas import UserCreate, UserUpdate
from src.exceptions import AdminAlreadyExistsError
from .models import User

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_users(self):
        result = await self.session.execute(select(User))
        return result.scalars()

    async def get_user_by_username(self, username: str):
        result = await self.session.execute(select(User).filter_by(username=username))
        return result.scalars().first()

    async def create_user(self, user):
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)

    async def create_admin_user(self):
        try:
            admin_user = await self.get_user_by_username("admin")

            if admin_user:
                raise AdminAlreadyExistsError("Пользователь с именем 'admin' уже существует.")

            admin_user = User(
                username="admin",
                first_name="Admin",
                last_name="User",
                email="admin@example.com",
                phone=None,
                status=True,
                is_system=True,
            )

            admin_user.set_password("admin")
            await self.create_user(admin_user)
            return admin_user
        except IntegrityError as e:
            raise ValueError("Ошибка при создании пользователя-администратора.") from e

    async def update_user(self, user:UserUpdate) -> User:
        old = await self.get_user_by_username(user.username)

        if not old:
            raise ValueError("Пользователь не найден")

        # Подтверждение смены пароля
        if user.password:
            old.set_password(user.password)

        update_data = {}
        for field, value in user.model_dump(exclude_unset=True).items():
            if field == "password":
                continue

            update_data[field] = value

        res = await self.session.execute(
            update(User)
            .where(User.username == user.username)
            .values(update_data)
            .returning(User)
        )

        await self.session.commit()
        return res.scalars().first()



    async def toggle_user(self,username:str) -> User:
        user = await self.get_user_by_username(username)
        res = await self.session.execute(update(User).where(User.username==user.username).values(status=not user.status).returning(User))
        await self.session.commit()
        return res.scalars().first()


    async def delete_user(self,username:str):
        await self.session.execute(delete(User).where(User.username == username))
        await self.session.commit()
