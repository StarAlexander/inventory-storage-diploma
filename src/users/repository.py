from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select,update,delete
from .schemas import UserCreate
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

    async def create_admin_user(self):
        admin_user = await self.get_user_by_username("admin")

        if admin_user:
            raise AdminAlreadyExistsError("Пользователь с именем 'admin' уже существует.")

        admin_user = User(username="admin")
        admin_user.set_password("admin")
        await self.create_user(admin_user)
        return admin_user
    
    async def update_user(self,username:str, user:UserCreate) -> User:
        old = await self.get_user_by_username(username)
        old.set_password(user.password)
        res = await self.session.execute(update(User).where(User.username==username).values(dict(username=user.username,password_hash=old.password_hash)).returning(User))
        await self.session.commit()
        return res.scalars().first()

    async def delete_user(self,username:str):
        await self.session.execute(delete(User).where(User.username == username))
        await self.session.commit()
