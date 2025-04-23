from src.database import AsyncSessionLocal
from src.repositories import RightRepository, RoleRepository
from src.roles.schemas import RightCreate, RoleCreate


class RoleService:

    
    @staticmethod
    async def create_role(data: RoleCreate):
        async with AsyncSessionLocal() as session:
            repo = RoleRepository(session)
            return await repo.create(data.model_dump())


    @staticmethod
    async def get_all_roles():
        async with AsyncSessionLocal() as session:
            repo = RoleRepository(session)
            return await repo.get_all()


    @staticmethod
    async def get_role_by_id(id: int):
        async with AsyncSessionLocal() as session:
            repo = RoleRepository(session)
            rr = await repo.get_by_id(id)
            print(rr.__dict__)
            return rr


    @staticmethod
    async def update_role(id: int, data: RoleCreate):
        async with AsyncSessionLocal() as session:
            repo = RoleRepository(session)
            return await repo.update(id, data.model_dump())


    @staticmethod
    async def delete_role(id: int):
        async with AsyncSessionLocal() as session:
            repo = RoleRepository(session)
            return await repo.delete(id)
    
    @staticmethod
    async def add_right_to_role(role_id: int, right:RightCreate):
        async with AsyncSessionLocal() as session:
            repo = RoleRepository(session)
            return await repo.add_right_to_role(role_id, right.model_dump())

    @staticmethod
    async def remove_right_from_role(role_id: int, right_id: int):
        async with AsyncSessionLocal() as session:
            repo = RoleRepository(session)
            return await repo.remove_right_from_role(role_id, right_id)
    

    @staticmethod
    async def add_user_to_role(role_id: int, user_data: dict):
        async with AsyncSessionLocal() as session:
            repo = RoleRepository(session)
            return await repo.add_user_to_role(role_id, user_data)


    @staticmethod
    async def remove_user_from_role(role_id: int, user_id: int):
        async with AsyncSessionLocal() as session:
            repo = RoleRepository(session)
            return await repo.remove_user_from_role(role_id, user_id)



class RightsService:


    @staticmethod
    async def create_right(data: RightCreate):
        async with AsyncSessionLocal() as session:
            repo = RightRepository(session)
            return await repo.create(data.model_dump())

    @staticmethod
    async def get_all_rights():
        async with AsyncSessionLocal() as session:
            repo = RightRepository(session)
            return await repo.get_all()


    @staticmethod
    async def get_right_by_id(id: int):
        async with AsyncSessionLocal() as session:
            repo = RightRepository(session)
            return await repo.get_by_id(id)


    @staticmethod
    async def update_right(id: int, data: RightCreate):
        async with AsyncSessionLocal() as session:
            repo = RightRepository(session)
            return await repo.update(id, data.model_dump())


    @staticmethod
    async def delete_right(id: int):
        async with AsyncSessionLocal() as session:
            repo = RightRepository(session)
            return await repo.delete(id)


    @staticmethod
    async def add_child_right(parent_id: int, child_id: int):
        async with AsyncSessionLocal() as session:
            repo = RightRepository(session)
            return await repo.add_child_right(parent_id, child_id)


    @staticmethod
    async def remove_child_right(parent_id: int, child_id: int):
        async with AsyncSessionLocal() as session:
            repo = RightRepository(session)
            return await repo.remove_child_right(parent_id, child_id)
    
    @staticmethod
    async def add_right_to_role(role_id: int, right_data: dict):
        async with AsyncSessionLocal() as session:
            repo = RightRepository(session)
            return await repo.add_right_to_role(role_id, right_data)
    
    @staticmethod
    async def remove_right_from_role(role_id: int, right_id: int):
        async with AsyncSessionLocal() as session:
            repo = RightRepository(session)
            return await repo.remove_right_from_role(role_id, right_id)