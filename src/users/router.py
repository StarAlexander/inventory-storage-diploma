from fastapi import APIRouter, HTTPException, status
from .schemas import UserCreate, UserResponse, UserUpdate
from .service import UserService
from src.exceptions import UserNotFoundError
import logging

logger = logging.getLogger('app')
router = APIRouter(tags=["Users"])

@router.post("/users/", response_model=UserResponse)
async def create_new_user(user_create: UserCreate):
    """Создает нового пользователя."""
    try:
        user = await UserService.create_user(user_create)
        return user
    except HTTPException as e:
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
    except UserNotFoundError as e:
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
        print([u.username for u in users])
        return users
    except Exception as e:
        logger.error(f"Нет пользователей: {str(e)}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/users/", response_model=UserResponse)
async def update_user(user_update: UserUpdate):
    """Обновляет пользователя"""
    try:
        updated = await UserService.update_user(user_update)
        return updated
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неизвестная ошибка при получении пользователя: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=str(e))



@router.patch("/users/{username}",response_model=UserResponse)
async def toggle_user_status(username:str):
    """Переключает статус пользователя"""
    try:
        updated = await UserService.toggle_user(username)
        return updated
    except UserNotFoundError as e:
        logger.error(f"Ошибка при получении пользователя: {str(e)}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=str(e))

@router.delete("/users/{username}")
async def delete_user(username: str):
    """Удаляет пользователя"""
    try:
        await UserService.delete_user(username)
        return {"Deleted": True}
    except UserNotFoundError as e:
        logger.error(f"Ошибка при удалении пользователя: {str(e)}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=str(e))