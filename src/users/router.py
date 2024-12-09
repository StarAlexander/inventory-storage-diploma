from fastapi import APIRouter, HTTPException, status
from .schemas import UserCreate, UserResponse
from .service import UserService
import logging

logger = logging.getLogger('app')
router = APIRouter(tags=["Users"])

@router.post("/users/", response_model=UserResponse)
async def create_new_user(user_create: UserCreate):
    """Создает нового пользователя."""
    try:
        user = await UserService.create_user(user_create)
        return user
    except ValueError as e:
        logger.error(f"Ошибка при создании пользователя \"{user_create.username}\": {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Неизвестная ошибка при создании пользователя \"{user_create.username}\": {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Неизвестная ошибка")

@router.get("/users/{username}", response_model=UserResponse)
async def get_user(username: str):
    """Возвращает конкретного пользователя"""
    try:
        user = await UserService.get_user_by_username(username)
        return user
    except HTTPException as e:
        logger.error(f"Ошибка при получении пользователя \"{username}\": {str(e)}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=str(e))

    except Exception as e:
        logger.error(f"Неизвестная ошибка при получении пользователя \"{username}\": {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))
    

@router.get("/users/", response_model=list[UserResponse])
async def get_users():
    """Возвращает список пользователей"""
    try:
        users = await UserService.get_users()
        return users
    except Exception as e:
        logger.error(f"Неизвестная ошибка при получении пользователей: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/users/{username}", response_model=UserResponse)
async def update_user(username: str, user_create: UserCreate):
    """Обновляет пользователя"""
    try:
        updated = await UserService.update_user(username,user_create)
        return updated
    except Exception as e:
        logger.error(f"Неизвестная ошибка при получении пользователя: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))


@router.delete("/users/{username}")
async def delete_user(username: str):
    """Удаляет пользователя"""
    try:
        await UserService.delete_user(username)
    except Exception as e:
        logger.error(f"Неизвестная ошибка при удалении пользователя: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))