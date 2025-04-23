
from src.roles.schemas import EntityType,RightType
from src.utils.get_current_user import get_current_user
from src.repositories import check_permission
from fastapi import APIRouter, Depends
from src.reports.service import ReportService

app = APIRouter(tags=["Reports"])

@app.get("/reports/general",response_model=dict)
@check_permission(EntityType.REPORTS, RightType.READ)
async def get_general_report(current_user = Depends(get_current_user)):
    try:

        report = await ReportService.generate_general_report()
        return report
    
    except Exception as e:
        print(e)
        raise


@app.get("/reports/users-by-role",response_model = dict)
@check_permission(EntityType.REPORTS,RightType.READ)
async def get_users_by_role_report(current_user = Depends(get_current_user)):
    try:

        report = await ReportService.generate_users_by_role_report()
        return report
    
    except Exception as e:
        print(e)
        raise


@app.get("/reports/economic-metrics",response_model=dict)
@check_permission(EntityType.REPORTS,RightType.READ)
async def get_economic_metrics_report(current_user = Depends(get_current_user)):
    try:
        report = await ReportService.generate_economic_metrics_report()
        return report
    
    except Exception as e:
        print(e)
        raise