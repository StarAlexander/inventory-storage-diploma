from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from fastapi import Request
from src.database import AsyncSessionLocal
from src.repositories import PostRepository, UserRepository
from src.users.schemas import AuditLogCreate, PostCreate, UserCreate, UserUpdate
from src.users.models import ActionType, User, UserAudit
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.serialization import Encoding,PublicFormat,PrivateFormat,NoEncryption
import user_agents


class UserService:


    @staticmethod
    def generate_ecdsa_keys():
        """Генерирует пару ECDSA-ключей (приватный + публичный)"""
        private_key = ec.generate_private_key(ec.SECP384R1())
        public_key = private_key.public_key()

        # Сериализация в PEM
        private_pem = private_key.private_bytes(
            encoding=Encoding.PEM,
            format=PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=NoEncryption()
        ).decode("utf-8")

        public_pem = public_key.public_bytes(
            encoding=Encoding.PEM,
            format=PublicFormat.SubjectPublicKeyInfo
        ).decode("utf-8")

        return {
            "private_key": private_pem,
            "public_key": public_pem
        }


    @staticmethod
    async def count():
        async with AsyncSessionLocal() as session:
            return await UserRepository(session).count()
        

    @staticmethod
    async def create_user(data: UserCreate):
        async with AsyncSessionLocal() as session:
            keys = UserService.generate_ecdsa_keys()
            repo = UserRepository(session)
            return await repo.create(data.model_dump(),keys)

    @staticmethod
    async def get_all_users():
        async with AsyncSessionLocal() as session:
            repo = UserRepository(session)
            return await repo.get_all()


    @staticmethod
    async def get_user_by_id(id: int):
        async with AsyncSessionLocal() as session:
            repo = UserRepository(session)
            return await repo.get_by_id(id)
        
    
    @staticmethod
    async def get_user_by_username(username:str):
        async with AsyncSessionLocal() as session:
            repo = UserRepository(session)
            return await repo.get_by_username(username)

    @staticmethod
    async def update_user(id: int, data: UserUpdate):
        async with AsyncSessionLocal() as session:
            repo = UserRepository(session)
            return await repo.update(id, data.model_dump())

    @staticmethod
    async def delete_user(id: int):
        async with AsyncSessionLocal() as session:
            repo = UserRepository(session)
            return await repo.delete(id)
    
    @staticmethod
    async def add_role_to_user(user_id: int, role_id: int):
        async with AsyncSessionLocal() as session:
            repo = UserRepository(session)
            return await repo.add_role_to_user(user_id, role_id)

    @staticmethod
    async def remove_role_from_user(user_id: int, role_id: int):
        async with AsyncSessionLocal() as session:
            repo = UserRepository(session)
            return await repo.remove_role_from_user(user_id, role_id)
    

class PostsService:


    @staticmethod
    async def create_post(data: PostCreate):
        async with AsyncSessionLocal() as session:
            repo = PostRepository(session)
            return await repo.create(data.model_dump())

    @staticmethod
    async def get_all_posts():
        async with AsyncSessionLocal() as session:
            repo = PostRepository(session)
            return await repo.get_all()


    @staticmethod
    async def get_post_by_id(id: int):
        async with AsyncSessionLocal() as session:
            repo = PostRepository(session)
            return await repo.get_by_id(id)

    @staticmethod
    async def update_post(id: int, data: PostCreate):
        async with AsyncSessionLocal() as session:
            repo = PostRepository(session)
            return await repo.update(id, data.model_dump())


    @staticmethod
    async def delete_post( id: int):
        async with AsyncSessionLocal() as session:
            repo = PostRepository(session)
            return await repo.delete(id)


    @staticmethod
    async def assign_user_to_post(post_id: int, user_id: int):
        async with AsyncSessionLocal() as session:
            repo = PostRepository(session)
            return await repo.assign_user_to_post(post_id, user_id)


    @staticmethod
    async def unassign_user_from_post(post_id: int, user_id: int):
        async with AsyncSessionLocal() as session:
            repo = PostRepository(session)
            return await repo.unassign_user_from_post(post_id, user_id)
        
    
    @staticmethod
    async def get_users_by_organization(org_id:int):
        async with AsyncSessionLocal() as session:
            repo = PostRepository(session)
            return await repo.get_users_by_organization(org_id)
        


class AuditLogService:
    @staticmethod
    async def log_action(
        action: AuditLogCreate,
        request: Optional[Request] = None
    ) -> UserAudit:
        """Log a user action to the audit trail"""
        async with AsyncSessionLocal() as db:

            if request:
                ip_address = request.client.host if request.client else "0.0.0.0"
                user_agent = request.headers.get("user-agent", "")
            else:
                ip_address = action.ip_address or "system"
                user_agent = action.user_agent or "system"

            # Parse user agent for better readability
            if user_agent:
                ua = user_agents.parse(user_agent)
                user_agent = f"{ua.browser.family} {ua.browser.version_string} on {ua.os.family}"

            audit_log = UserAudit(
                user_id=action.user_id,
                action=action.action.value,
                entity_type=action.entity_type,
                entity_id=action.entity_id,
                old_data=action.old_data,
                new_data=action.new_data,
                performed_by=action.performed_by,
                ip_address=ip_address,
                user_agent=user_agent,
                reason=action.reason
            )

            db.add(audit_log)
            await db.commit()
            await db.refresh(audit_log)
            return audit_log

    @staticmethod
    async def get_logs(
        user_id: Optional[int] = None,
        action: Optional[ActionType] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        performer_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> List[UserAudit]:
        """Retrieve audit logs with filtering options"""
        async with AsyncSessionLocal() as db:

            query = select(UserAudit).options(selectinload(UserAudit.performer))
            
            if user_id:
                query = query.where(UserAudit.user_id == user_id)
            if action:
                query = query.where(UserAudit.action == action.value)
            if entity_type:
                query = query.where(UserAudit.entity_type == entity_type)
            if entity_id:
                query = query.where(UserAudit.entity_id == entity_id)
            if performer_id:
                query = query.where(UserAudit.performed_by == performer_id)
            if start_date:
                query = query.where(UserAudit.created_at >= start_date)
            if end_date:
                query = query.where(UserAudit.created_at <= end_date)
            
            res = await db.execute(query.order_by(UserAudit.created_at.desc()).limit(limit))
            return res.scalars().all()

    @staticmethod
    async def get_recent_logs(hours: int = 24) -> List[UserAudit]:
        """Get logs from the last X hours"""
        cutoff = datetime.now() - timedelta(hours=hours)
        async with AsyncSessionLocal() as db:
            query = select(UserAudit).where(UserAudit.created_at >= cutoff)\
                    .order_by(UserAudit.created_at.desc())\

            res = await db.execute(query)
            return res.scalars().all()