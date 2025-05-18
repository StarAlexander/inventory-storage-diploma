import asyncio
from datetime import datetime
from dateutil.parser import parse
import json
from fastapi.responses import StreamingResponse
from typing import Optional
from fastapi import Depends, HTTPException,APIRouter, Query, Request
from sqlalchemy import select
from src.repositories import check_permission
from src.utils.get_current_user import get_current_user
from src.roles.schemas import EntityType, RightType
from src.users.schemas import AuditLogResponse, PostCreate, UserCreate, UserUpdate
from src.users.service import AuditLogService, UserService, PostsService
from src.users.models import AuthLog, UserAudit
from src.database import AsyncSessionLocal


app = APIRouter(tags=["Users, Posts"])

@app.post("/users/register")
async def create_user(user: UserCreate,current_user = Depends(get_current_user)):
    return await UserService.create_user(user)


@app.get("/users/")
@check_permission(EntityType.USERS, RightType.READ)
async def list_users(current_user = Depends(get_current_user)):
    return await UserService.get_all_users()


@app.get("/users/{user_id}")
async def get_user(user_id: int,current_user = Depends(get_current_user)):
    user = await UserService.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/users/{user_id}")
@check_permission(EntityType.USERS, RightType.UPDATE)
async def update_user(user_id: int, user: UserUpdate,current_user = Depends(get_current_user)):
    user = await UserService.update_user(user_id, user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.delete("/users/{user_id}")
@check_permission(EntityType.USERS, RightType.DELETE)
async def delete_user(user_id: int,current_user = Depends(get_current_user)):
    user = await UserService.delete_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users/{user_id}/roles/{role_id}")
@check_permission(EntityType.USERS, RightType.UPDATE)
async def add_role_to_user(user_id: int, role_id: int,current_user = Depends(get_current_user)):
    try:

        result = await UserService.add_role_to_user(user_id, role_id)
        if isinstance(result, dict):
            return result
        return {"message": f"Role {role_id} added to User {user_id}"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500,detail=str(e))


@app.delete("/users/{user_id}/roles/{role_id}")
@check_permission(EntityType.USERS, RightType.UPDATE)
async def delete_role_from_user(user_id: int, role_id:int,current_user = Depends(get_current_user)):
    try:

        result = await UserService.remove_role_from_user(user_id,role_id)
        if isinstance(result,dict):
            return result
        return {"Message": f"Role {role_id} has been deleted from {user_id}"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500,detail=str(e))

# Создание должности
@app.post("/posts/")
@check_permission(EntityType.POSTS, RightType.CREATE)
async def create_post(post: PostCreate,current_user = Depends(get_current_user)):
    try:
        return await PostsService.create_post(post)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500,detail=str(e))


# Получение всех должностей
@app.get("/posts/")
@check_permission(EntityType.POSTS, RightType.READ)
async def list_posts(current_user = Depends(get_current_user)):
    try:

        return await PostsService.get_all_posts()
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500,detail=str(e))


# Получение должности по ID
@app.get("/posts/{post_id}")
@check_permission(EntityType.POSTS, RightType.READ)
async def get_post(post_id: int,current_user = Depends(get_current_user)):
    post = await PostsService.get_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


# Обновление должности
@app.put("/posts/{post_id}")
@check_permission(EntityType.POSTS, RightType.UPDATE)
async def update_post(post_id: int, post: PostCreate,current_user = Depends(get_current_user)):
    return await PostsService.update_post(post_id, post)


# Удаление должности
@app.delete("/posts/{post_id}")
@check_permission(EntityType.POSTS, RightType.DELETE)
async def delete_post(post_id: int,current_user = Depends(get_current_user)):
    return await PostsService.delete_post(post_id)


# Привязка пользователя к должности
@app.post("/posts/{post_id}/users/{user_id}")
@check_permission(EntityType.POSTS, RightType.UPDATE)
async def assign_user_to_post(post_id: int, user_id: int,current_user = Depends(get_current_user)):
    return await PostsService.assign_user_to_post(post_id, user_id)


# Отвязка пользователя от должности
@app.delete("/posts/{post_id}/users/{user_id}")
@check_permission(EntityType.POSTS, RightType.UPDATE)
async def unassign_user_from_post(post_id: int, user_id: int,current_user = Depends(get_current_user)):
    return await PostsService.unassign_user_from_post(post_id, user_id)


@app.get("/posts/users/organizations/{org_id}")
@check_permission(EntityType.POSTS,RightType.READ)
async def get_users_by_organization(org_id: int,
            position_name: Optional[str] = Query(None, alias="position_name"),
            current_user = Depends(get_current_user)):
    return await PostsService.get_users_by_organization(org_id,position_name)

# Аудит

@app.get("/user-logs")
async def get_audit_logs(
    action: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),  # Changed to string
    start_date: Optional[str] = Query(None),  # Changed to string
    end_date: Optional[str] = Query(None),  # Changed to string
    limit: int = Query(100),
    current_user = Depends(get_current_user)
):
    """Get filtered audit logs"""
    try:
        # Convert parameters to correct types
        user_id_int = int(user_id) if user_id else None
        start_date_dt = parse(start_date) if start_date else None
        end_date_dt = parse(end_date) if end_date else None
        
        logs = await AuditLogService.get_logs(
            user_id=user_id_int,
            action=action,
            entity_type=entity_type,
            start_date=start_date_dt,
            end_date=end_date_dt,
            limit=limit
        )
        print(logs)
        return logs
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid parameter format: {str(e)}"
        )
    except Exception as e:
        print(f"Error fetching logs: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch logs"
        )

@app.get("/user-logs/recent")
async def get_recent_logs(
    hours: int = 24,
    current_user = Depends(get_current_user)
):
    """Get recent audit logs"""
    return await AuditLogService.get_recent_logs(hours)

@app.get("/auth/logs")
async def get_auth_logs(
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100,
    current_user = Depends(get_current_user)
):
    """Get authentication logs with filtering options"""
    try:
        async with AsyncSessionLocal() as db:
            query = select(AuthLog)
            
            # Apply filters
            if user_id:
                query = query.where(AuthLog.user_id == user_id)
            if action:
                query = query.where(AuthLog.action == action)
            if start_date:
                query = query.where(AuthLog.timestamp >= start_date)
            if end_date:
                query = query.where(AuthLog.timestamp <= end_date)
            
            # Execute query with limit
            result = await db.execute(
                query.order_by(AuthLog.timestamp.desc()).limit(limit))
            
            # Return properly serialized results
            logs = result.scalars().all()
            return logs
            
    except Exception as e:
        # Log the full error for debugging
        print(f"Error fetching auth logs: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch authentication logs"
        )