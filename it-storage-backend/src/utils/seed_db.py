from datetime import datetime, timedelta
import random
import uuid

# Импортируем модели
from src.warehouses.schemas import ZoneType
from src.users.schemas import UserCreate
from src.organizations.schemas import OrganizationBase
from src.departments.schemas import DepartmentCreate
from src.users.schemas import PostCreate
from src.objects.schemas import ObjectCreate
from src.warehouses.schemas import WarehouseCreate, ZoneCreate
from src.warehouses.service import WarehouseService
from src.users.service import UserService, PostsService
from src.organizations.service import OrganizationService
from src.departments.service import DepartmentService
from src.objects.service import ObjectService



async def seed_db(categories):
    orgs = await seed_organizations()
    deps = await seed_departments(orgs)
    users = await seed_users(deps)
    posts = await seed_posts()
    await assign_users_to_posts(users,posts)
    warehouses = await seed_warehouses(orgs,users)
    zones = await seed_zones(warehouses)
    objs = await seed_objects(categories)


async def seed_organizations():
    organizations = []
    for i in range(1, 21):
        data = OrganizationBase(
            name=f"Организация {i}",
            email=f"org{i}@example.com",
            phone=f"+7900123456{i % 10}",
            address=f"Адрес организации {i}"
        )
        org = await OrganizationService.create_organization(data)
        organizations.append(org)
        print(f"Создана организация {i}")
    return organizations


async def seed_departments(organizations):
    departments = []
    for org in organizations:
        for j in range(1, random.randint(2, 4)):
            data = DepartmentCreate(
                organization_id=org.id,
                name=f"Отдел {j} в {org.name}",
                abbreviation=f"ОТД{j}-{org.id}"
            )
            dept = await DepartmentService.create_department(data)
            departments.append(dept)
            print(f"Создан отдел {dept.name}")
    return departments



async def seed_users(departments):
    users = []
    for i in range(1, 21):
        data = UserCreate(
            username=f"user_{uuid.uuid4().hex[:8]}",
            email=f"user_{i}@example.com",
            first_name=f"Имя{i}",
            last_name=f"Фамилия{i}",
            middle_name=f"Отчество{i}",
            phone=f"+790012345{i}",
            is_active=True,
            department_id=random.choice(departments).id,
            password="SecurePass123!"
        )
        user = await UserService.create_user(data)
        users.append(user)
        print(f"Создан пользователь {user.username}")
    return users


async def seed_posts():
    posts = []
    for i in range(1, 21):
        post_data = PostCreate(name=f"Должность {i}", description=f"Описание {i}",organization_id=i)
        post = await PostsService.create_post(post_data)
        posts.append(post)
        print(f"Создана должность {post.name}")
    return posts


async def assign_users_to_posts(users, posts):
    for user in users:
        post = random.choice(posts)
        await PostsService.assign_user_to_post(post.id, user.id)
        print(f"Пользователь {user.id} назначен на должность {post.id}")


async def seed_warehouses(organizations, managers):
    warehouses = []
    for i in range(1, 21):
        warehouse_data = WarehouseCreate(
            name=f"Склад {i}",
            address=f"Адрес склада {i}",
            manager_id=random.choice(managers).id,
            organization_id=random.choice(organizations).id
        )
        warehouse = await WarehouseService.create_warehouse(warehouse_data.model_dump())
        warehouses.append(warehouse)
        print(f"Создан склад {warehouse.name}")
    return warehouses


async def seed_zones(warehouses):
    zones = []
    zone_types = [ZoneType.RECEIPT, ZoneType.REPAIR, ZoneType.SHIPPING, ZoneType.STORAGE]

    for warehouse in warehouses:
        for i in range(1, 3):  # по 2 зоны на склад
            zone_data = ZoneCreate(
                warehouse_id=warehouse.id,
                department_id=1,
                name=f"Зона {i} {warehouse.name}",
                type=random.choice(zone_types)
            )
            zone = await WarehouseService.create_zone(zone_data.model_dump())
            zones.append(zone)
            print(f"Создана зона {zone.name}")
    return zones


async def seed_objects(categories):
    objects = []
    names = ["Принтер", "Монитор", "Ноутбук", "Сканер", "Системный блок", "Телефон"]

    for i in range(1, 21):
        category = random.choice(categories)

        obj_data = ObjectCreate(
            category_id=category.id,
            department_id=i,
            name=f"{random.choice(names)} {i}",
            description=f"Оборудование {i}",
            inventory_number=f"INV-{i}-2025",
            serial_number=f"SN-{uuid.uuid4().hex[:10]}",
            cost=round(random.uniform(1000, 100000), 2),
            purchase_date=(datetime.now() - timedelta(days=random.randint(100, 1000))).isoformat(),
            warranty_expiry_date=(datetime.now() + timedelta(days=random.randint(100, 1000))).isoformat(),
            status="active",
        )

        obj = await ObjectService.create_object(obj_data)
        objects.append(obj)
        print(f"Создан объект {obj.name}")
    return objects

