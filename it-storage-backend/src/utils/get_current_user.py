from typing import Optional

from fastapi import Request
from src.users.service import UserService
from sqlalchemy.ext.asyncio import AsyncSession
from src.users.models import User


async def get_current_user(request:Request) -> Optional[User]:
    username = request.state.username
    return await UserService.get_user_by_username(username)