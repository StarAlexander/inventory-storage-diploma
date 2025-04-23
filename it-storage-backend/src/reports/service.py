from sqlalchemy import func, select
from src.users.service import UserService
from src.users.models import User
from src.organizations.service import OrganizationService
from src.objects.service import ObjectService
from src.objects.models import ObjectCategory,Object
from src.objects.service import ObjectCategoryService
from src.departments.service import DepartmentService
from src.roles.models import Role
from src.database import AsyncSessionLocal



class ReportService:
    @staticmethod
    async def generate_general_report():
        user_count = await UserService.count()
        object_count = await ObjectService.count()
        organization_count = await OrganizationService.count()
        department_count = await DepartmentService.count()
        category_count = await ObjectCategoryService.count()
        report = {
            "user_count": user_count,
            "object_count": object_count,
            "organization_count": organization_count,
            "department_count": department_count,
            "category_count": category_count
        }
        return report
    

    @staticmethod
    async def generate_users_by_role_report():
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Role.name, func.count(User.id))
                .join(Role.users)
                .group_by(Role.name)
            )
            users_by_role = result.all()
            report = {role_name: count for role_name, count in users_by_role}
        return report
    

    @staticmethod
    async def generate_economic_metrics_report():
        async with AsyncSessionLocal() as db:
            # Количество объектов по категориям
            objects_by_category = await db.execute(
                select(ObjectCategory.name, func.count(Object.id))
                .join(ObjectCategory.objects)
                .group_by(ObjectCategory.name)
            )
            objects_by_category_data = objects_by_category.all()

            # Средняя стоимость объектов по категориям
            avg_cost_by_category = await db.execute(
                select(ObjectCategory.name, func.avg(Object.cost))
                .join(ObjectCategory.objects)
                .group_by(ObjectCategory.name)
            )
            avg_cost_by_category_data = avg_cost_by_category.all()

            report = {
                "objects_by_category": {name: count for name, count in objects_by_category_data},
                "avg_cost_by_category": {name: cost for name, cost in avg_cost_by_category_data}
            }
        return report