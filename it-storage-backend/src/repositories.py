from typing import Any, Dict, List
from fastapi import HTTPException
from sqlalchemy.future import select
from sqlalchemy.orm import Session,selectinload,joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.inspection import inspect
from sqlalchemy.exc import NoResultFound,IntegrityError
from src.departments.schemas import DepartmentCreate
from src.departments.models import Department
from src.objects.models import DynamicField, Object, ObjectCategory,ObjectDynamicFieldValue, SelectValue
from src.objects.schemas import ObjectCategoryCreate
from src.organizations.models import Organization
from src.roles.models import Right, Role
from src.users.models import Post, User
from passlib.context import CryptContext
import logging

pwd_context = CryptContext(schemes=["bcrypt"])

logger = logging.getLogger("app")



class BaseRepository:
    def __init__(self, model, db: AsyncSession):
        self.model = model
        self.db = db


    async def _load_relationships(self, query):
        try:


            if self.model.__name__ == "Role":
                return query.options(
                    selectinload(Role.rights).selectinload(Right.children),
                    selectinload(Role.users),
                    selectinload(Role.children),
                    selectinload(Role.own_audits)
                )
        
            # Special handling for Right model
            if self.model.__name__ == "Right":
                return query.options(
                    selectinload(Right.roles),
                    selectinload(Right.children),
                    selectinload(Right.pages),
                    selectinload(Right.departments)
                )
            mapper = inspect(self.model)
            for rel in mapper.relationships:
                if rel.direction.name in ["ONETOMANY","MANYTOMANY"]:
                    query = query.options(joinedload(getattr(self.model, rel.key)))
            
            if hasattr(self.model, "dynamic_values"):
                query = query.options(joinedload(self.model.dynamic_values).joinedload(ObjectDynamicFieldValue.field))
            return query
        except Exception as e:
            print(e)


    async def get_all(self) -> List:
        try:
            query = select(self.model)
            query = await self._load_relationships(query)
            result = await self.db.execute(query)

            return result.unique().scalars().all()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_by_id(self, id: int):
        try:
            query = select(self.model).where(self.model.id == id)
            query = await self._load_relationships(query)
            result = await self.db.execute(query)
            obj = result.unique().scalar_one_or_none()
            if not obj:
                raise NoResultFound(f"{self.model.__name__} not found")
            return obj
        except NoResultFound:
            raise HTTPException(status_code=404, detail=f"{self.model.__name__} not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def create(self, data: dict):
        try:
            obj = self.model(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            return await self.get_by_id(obj.id)
        except IntegrityError as ie:
            await self.db.rollback()
            raise HTTPException(status_code=409, detail=str(ie.orig))
        except Exception as e:
            print(e)
            await self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    async def update(self, id: int, data: dict):
        try:
            obj = await self.get_by_id(id)
            for key, value in data.items():
                if value is not None:
                    setattr(obj, key, value)
            await self.db.commit()
            await self.db.refresh(obj)
            return await self.get_by_id(id)
        except IntegrityError as ie:
            await self.db.rollback()
            raise HTTPException(status_code=409, detail=str(ie.orig))
        except NoResultFound:
            raise HTTPException(status_code=404, detail=f"{self.model.__name__} not found")
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    async def delete(self, id: int):
        try:
            obj = await self.get_by_id(id)
            await self.db.delete(obj)
            await self.db.commit()
            return {"message": f"{self.model.__name__} deleted successfully"}
        except Exception as e:
            logger.info(e)
            await self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))



class OrganizationRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(Organization, db)


class DepartmentRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(Department, db)


class ObjectCategoryRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(ObjectCategory, db)


class DynamicFieldRepository(BaseRepository):
    def __init__(self, db: AsyncSession):
        super().__init__(DynamicField, db)

    
    async def create(self,data: dict):
        try:
            print(f"data = {data}")
            field = DynamicField(
                category_id=data['category_id'],
                name = data['name'],
                field_type = data['field_type'],
                description = data['description']
            )

            if data['field_type'] == "select" and len(data['select_options']) > 0:
                for option in data['select_options']:
                    if option.get('value'):
                        select_value = SelectValue(
                            value = option['value'],
                            display_name = option.get('display_name',option['value'])
                        )
                        field.select_options.append(select_value)
            
            self.db.add(field)
            await self.db.commit()
            await self.db.refresh(field)
            return await self.get_by_id(field.id)
        
        except Exception as e:
            print(e)

    async def update(self, id: int, data: dict):
        try:
            field = await self.get_by_id(id)
            if not field:
                raise ValueError(f"Field with id {id} not found")
            
            # Handle select options separately
            if "select_options" in data:

                diff = list(set([o.value for o in field.select_options]) - set([op["value"] for op in data["select_options"]]))
                print(diff)
                res = await self.db.execute(select(ObjectDynamicFieldValue).where(ObjectDynamicFieldValue.value.in_(diff)))
                vals = res.scalars().all()
                print([v.value for v in vals])
                print(len(vals))
                if (len(vals) > 0):
                    raise HTTPException(status_code=400,detail="Some of deleted values are in use")


                # Clear existing options
                field.select_options.clear()
                
                # Add new options
                for option in data["select_options"]:
                    if option.get("value"):  # Skip empty values
                        field.select_options.append(SelectValue(
                            field_id=id,
                            value=option["value"],
                            display_name=option.get("display_name", option["value"])
                        ))
                # Remove select_options from data to avoid setting it as an attribute
                del data["select_options"]
            
            # Update other attributes
            for key, value in data.items():
                if value is not None and hasattr(field, key):
                    setattr(field, key, value)
            
            await self.db.commit()
            await self.db.refresh(field)
            return field
        

        except HTTPException as e:
            print("select options error")
            raise

        except Exception as e:
            await self.db.rollback()
            print(f"Error updating field: {e}")
            raise






class ObjectRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(Object, db)

    async def create(self, data: dict):
        try:
            dynamic_values = data.pop("dynamic_values", [])
            obj = self.model(**data)
            self.db.add(obj)
            await self.db.flush() 
            for dynamic_value in dynamic_values:
                field_id = dynamic_value["field_id"]
                value = dynamic_value["value"]
                odfv = ObjectDynamicFieldValue(
                        object_id=obj.id,
                        field_id=field_id,
                        value=value
                )
                self.db.add(odfv)
            await self.db.commit()
            obj = await self.get_by_id(obj.id)
            return obj
        except IntegrityError as ie:
            await self.db.rollback()
            raise HTTPException(status_code=409, detail=str(ie.orig))
        except Exception as e:
            print(e)
            await self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))


    async def update(self, id: int, data: Dict[str, Any]):
        try:
            # Получаем объект из базы данных
            obj = await self.get_by_id(id)
            if not obj:
                raise HTTPException(status_code=404, detail="Object not found")

            # Обновляем основные поля
            for key, value in data.items():
                if key == "dynamic_values":
                    # Обрабатываем dynamic_values отдельно
                    await self._update_dynamic_values(obj, value)
                elif value is not None:
                    setattr(obj, key, value)

            # Фиксируем изменения
            await self.db.commit()
            await self.db.refresh(obj)
            return obj
        except IntegrityError as ie:
            await self.db.rollback()
            raise HTTPException(status_code=409, detail=str(ie.orig))
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    async def _update_dynamic_values(self, obj, dynamic_values: List[Dict[str, Any]]):
        """
        Обновляет dynamic_values для объекта.
        """
        # Удаляем старые значения
        obj.dynamic_values.clear()

        # Добавляем новые значения
        for value_data in dynamic_values:
            field_id = value_data.get("field_id")
            value = value_data.get("value")
            if field_id is None or value is None:
                raise HTTPException(status_code=400, detail="Invalid dynamic value data")

            # Создаем новый объект ObjectDynamicFieldValue
            new_value = ObjectDynamicFieldValue(
                object_id=obj.id,
                field_id=field_id,
                value=value
            )
            obj.dynamic_values.append(new_value)




class RoleRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(Role, db)

    async def add_user_to_role(self, role_id: int, user_data: dict):
        role = await self.get_by_id(role_id)
        if not role:
            raise ValueError(f"Role with id {role_id} not found")
        user = User(**user_data)
        role.users.append(user)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(role)
        return {"message": f"User {user.id} added to Role {role_id}"}

    async def remove_user_from_role(self, role_id: int, user_id: int):
        # Получаем роль с пользователями
        stmt = select(Role).where(Role.id == role_id).options(selectinload(Role.users))
        result = await self.db.execute(stmt)
        role = result.scalars().first()
        
        if not role:
            raise ValueError(f"Role with id {role_id} not found")
        
        # Получаем пользователя
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalars().first()
        
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        # Удаляем пользователя из роли
        role.users.remove(user)
        await self.db.commit()
        await self.db.refresh(role)
        
        return {"message": f"User {user_id} removed from Role {role_id}"}

    async def add_right_to_role(self, role_id: int, right: dict):
        # Получаем роль с правами
        stmt = select(Role).where(Role.id == role_id).options(selectinload(Role.rights))
        result = await self.db.execute(stmt)
        role = result.scalars().first()
        
        if not role:
            raise ValueError(f"Role with id {role_id} not found")
        
        r = Right(**right)
        self.db.add(r)
        await self.db.commit()
        self.db.refresh(r)
        
        # Добавляем право к роли
        role.rights.append(r)
        await self.db.commit()
        await self.db.refresh(role)
        
        return {"message": f"Right {r.id} added to Role {role_id}"}

    async def remove_right_from_role(self, role_id: int, right_id: int):
        # Получаем роль с правами
        stmt = select(Role).where(Role.id == role_id).options(selectinload(Role.rights))
        result = await self.db.execute(stmt)
        role = result.scalars().first()
        
        if not role:
            raise ValueError(f"Role with id {role_id} not found")
        
        # Получаем право
        stmt = select(Right).where(Right.id == right_id)
        result = await self.db.execute(stmt)
        right = result.scalars().first()
        
        if not right:
            raise ValueError(f"Right with id {right_id} not found")
        
        # Удаляем право из роли
        role.rights.remove(right)
        await self.db.commit()
        await self.db.refresh(role)
        
        return {"message": f"Right {right_id} removed from Role {role_id}"}



class RightRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(Right, db)

    async def add_child_right(self, parent_id: int, child_id: int):
        parent = await self.get_by_id(parent_id)
        if not parent:
            raise ValueError(f"Parent Right with id {parent_id} not found")
        child = await self.get_by_id(child_id)
        if not child:
            raise ValueError(f"Child Right with id {child_id} not found")
        parent.children.append(child)
        await self.db.commit()
        await self.db.refresh(parent)
        return {"message": f"Child Right {child_id} added to Parent Right {parent_id}"}

    async def remove_child_right(self, parent_id: int, child_id: int):
        parent = await self.get_by_id(parent_id)
        if not parent:
            raise ValueError(f"Parent Right with id {parent_id} not found")
        child = await self.get_by_id(child_id)
        if not child:
            raise ValueError(f"Child Right with id {child_id} not found")
        parent.children.remove(child)
        await self.db.commit()
        await self.db.refresh(parent)
        return {"message": f"Child Right {child_id} removed from Parent Right {parent_id}"}

    async def add_right_to_role(self, role_id: int, right_data: dict):
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise ValueError(f"Role with id {role_id} not found")
        right = Right(**right_data)
        role.rights.append(right)
        self.db.add(right)
        await self.db.commit()
        await self.db.refresh(role)
        return {"message": f"Right {right.id} added to Role {role_id}"}

    async def remove_right_from_role(self, role_id: int, right_id: int):
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise ValueError(f"Role with id {role_id} not found")
        right = self.db.query(Right).filter(Right.id == right_id).first()
        if not right:
            raise ValueError(f"Right with id {right_id} not found")
        role.rights.remove(right)
        await self.db.commit()
        await self.db.refresh(role)
        return {"message": f"Right {right_id} removed from Role {role_id}"}





class UserRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(User, db)

    async def create(self, data: dict):
        try:
            data["password"] = pwd_context.hash(data["password"])
            obj = self.model(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            r = await self.get_by_id(obj.id)
            return r
        except IntegrityError as ie:
            await self.db.rollback()
            raise HTTPException(status_code=409, detail=str(ie.orig))
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
    
    async def get_by_username(self,username:str):
        query = select(User).where(User.username == username)
        query = await self._load_relationships(query)
        result = await self.db.execute(query)
        obj = result.unique().scalar_one_or_none()
        if not obj:
            raise NoResultFound(f"User not found")
        return obj

    async def add_role_to_user(self, user_id: int, role_id: int):
        # Получаем пользователя с ролями
        stmt = select(User).where(User.id == user_id).options(selectinload(User.roles))
        result = await self.db.execute(stmt)
        user = result.unique().scalars().first()
        
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        # Получаем роль
        stmt = select(Role).where(Role.id == role_id)
        result = await self.db.execute(stmt)
        role = result.scalars().first()
        
        if not role:
            raise ValueError(f"Role with id {role_id} not found")
        
        # Добавляем роль пользователю
        user.roles.append(role)
        await self.db.commit()
        await self.db.refresh(user)
        
        return {"message": f"Role {role_id} added to User {user_id}"}

    async def remove_role_from_user(self, user_id: int, role_id: int):
        # Получаем пользователя с ролями
        stmt = select(User).where(User.id == user_id).options(selectinload(User.roles))
        result = await self.db.execute(stmt)
        user = result.scalars().first()
        
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        # Получаем роль
        stmt = select(Role).where(Role.id == role_id)
        result = await self.db.execute(stmt)
        role = result.scalars().first()
        
        if not role:
            raise ValueError(f"Role with id {role_id} not found")
        
        # Удаляем роль у пользователя
        user.roles.remove(role)
        await self.db.commit()
        await self.db.refresh(user)
        
        return {"message": f"Role {role_id} removed from User {user_id}"}
    

class PostRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(Post, db)

    async def assign_user_to_post(self, post_id: int, user_id: int):
        # Получаем должность с пользователями
        stmt = select(Post).where(Post.id == post_id).options(selectinload(Post.users))
        result = await self.db.execute(stmt)
        post = result.scalars().first()
        
        if not post:
            raise ValueError(f"Post with id {post_id} not found")
        
        # Получаем пользователя
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalars().first()
        
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        # Привязываем пользователя к должности
        post.users.append(user)
        await self.db.commit()
        await self.db.refresh(post)
        
        return {"message": f"User {user_id} assigned to Post {post_id}"}

    async def unassign_user_from_post(self, post_id: int, user_id: int):
        # Получаем должность с пользователями
        stmt = select(Post).where(Post.id == post_id).options(selectinload(Post.users))
        result = await self.db.execute(stmt)
        post = result.scalars().first()
        
        if not post:
            raise ValueError(f"Post with id {post_id} not found")
        
        # Получаем пользователя
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalars().first()
        
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        # Отвязываем пользователя от должности
        post.users.remove(user)
        await self.db.commit()
        await self.db.refresh(post)
        
        return {"message": f"User {user_id} unassigned from Post {post_id}"}