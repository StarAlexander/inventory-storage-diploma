from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import json
from logging.config import fileConfig
from fastapi.responses import JSONResponse
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Optional
from fastapi import Depends, FastAPI, HTTPException, Request, status
import logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from src.organizations.service import OrganizationService
from src.organizations.schemas import OrganizationBase
from src.departments.service import DepartmentService
from src.departments.schemas import DepartmentCreate
from src.objects.service import ObjectCategoryService
from src.warehouses.service import WarehouseService
from src.objects.schemas import ObjectCategoryCreate
from src.database import AsyncSessionLocal, engine
from src.repositories import pwd_context
from src.departments.router import app as dep_router
from src.objects.router import app as obj_router
from src.organizations.router import app as org_router
from src.roles.router import app as roles_router
from src.users.router import app as users_router
from src.warehouses.router import warehouse_router
from src.users.schemas import PostCreate, UserCreate
from src.users.models import AuthLog, User, UserAudit
from src.roles.service import RoleService,RoleCreate
from dotenv import load_dotenv
from jose import JWTError, jwt
import os
from src.users.service import PostsService, UserService
from src.database import Base

load_dotenv()





logging_config_path = os.path.join(os.path.dirname(__file__), '../logging.ini')
if not os.path.exists(logging_config_path):
    raise FileNotFoundError(f"Logging config not found: {logging_config_path}")
fileConfig(logging_config_path)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        
        async with engine.begin() as db:
            await db.run_sync(Base.metadata.drop_all)
            await db.run_sync(Base.metadata.create_all)
        
        async with AsyncSessionLocal() as db:
            admin_username = "admin"
            admin_email = "admin@example.com"
            admin_password = "Admin123!"
            admin_exists = await db.execute(
                select(User).where(User.username == admin_username)
            )
            admin_exists = admin_exists.scalars().first()

            if not admin_exists:
                admin_data = {
                    "username": admin_username,
                    "email": admin_email,
                    "password": admin_password,
                    "is_system": True,
                    "is_active": True,
                }
                await UserService.create_user(data=UserCreate(**admin_data))
                await UserService.create_user(data=UserCreate(username="taivallinen",email="starchenckoal@yandex.ru",first_name="Alex",middle_name="Igorevich",last_name="starchencko",phone="+89636303906",password="9001234ABC!"))
                await OrganizationService.create_organization(data=OrganizationBase(name="ЦИИР",email="cair@cair-edu.ru"))
                await OrganizationService.create_organization(data=OrganizationBase(name="СТАНКИН",email="stankin@mail.ru"))
                await DepartmentService.create_department(data=DepartmentCreate(organization_id=1,name="ЦИИР первый отдел",abbreviation="CAIR-1"))
                await DepartmentService.create_department(data=DepartmentCreate(organization_id=2,name="СТАНКИН первый отдел",abbreviation="STANKIN-1"))
                await ObjectCategoryService.create_category(data=ObjectCategoryCreate(name="Компьютеры"))
                await ObjectCategoryService.create_category(data=ObjectCategoryCreate(name="Мониторы"))
                await ObjectCategoryService.create_category(data=ObjectCategoryCreate(name="Программное обеспечение"))
                await ObjectCategoryService.create_category(data=ObjectCategoryCreate(name="Сетевые устройства"))
                await ObjectCategoryService.create_category(data=ObjectCategoryCreate(name="Устройства"))
                await ObjectCategoryService.create_category(data=ObjectCategoryCreate(name="Принтеры"))
                await ObjectCategoryService.create_category(data=ObjectCategoryCreate(name="Картриджи"))
                await ObjectCategoryService.create_category(data=ObjectCategoryCreate(name="Расходные материалы"))
                await ObjectCategoryService.create_category(data=ObjectCategoryCreate(name="Телефоны"))
                await ObjectCategoryService.create_category(data=ObjectCategoryCreate(name="Стойки"))
                await WarehouseService.create_doc_template(data={"name":"receipt","type":"RECEIPT"})
                await WarehouseService.create_doc_template(data={"name":"move","type":"MOVE"})
                await WarehouseService.create_doc_template(data={"name":"issue","type":"ISSUE"})
                await WarehouseService.create_doc_template(data={"name":"write_off","type":"WRITE_OFF"})
                await PostsService.create_post(PostCreate(name="Менеджер ЦИИР", description="sldfkj",organization_id=1))
                await PostsService.assign_user_to_post(1,2)
                await RoleService.create_role(RoleCreate(name="Менеджер",description="менеджер склада",rights=[{"entity_type":"warehouses","right_type":"read"},{"entity_type":"warehouses","right_type":"create"},{"entity_type":"warehouses","right_type":"update"},{"entity_type":"warehouses","right_type":"delete"},{"entity_type":"warehouse_zones","right_type":"read"},{"entity_type":"warehouse_zones","right_type":"create"},{"entity_type":"warehouse_zones","right_type":"update"},{"entity_type":"warehouse_zones","right_type":"delete"},{"entity_type":"warehouse_transactions","right_type":"read"},{"entity_type":"warehouse_transactions","right_type":"create"},{"entity_type":"warehouse_transactions","right_type":"update"},{"entity_type":"warehouse_transactions","right_type":"delete"},{"entity_type":"warehouse_documents","right_type":"read"},{"entity_type":"warehouse_documents","right_type":"create"},{"entity_type":"warehouse_documents","right_type":"update"},{"entity_type":"warehouse_documents","right_type":"delete"}]))
                await RoleService.create_role(RoleCreate(name="Модератор",description="Управление инвентарем, информацией об организациях, подразделениях, ролях и пользователях",
                                                         rights=[{"entity_type":"organizations","right_type":"read"},{"entity_type":"organizations","right_type":"create"},{"entity_type":"organizations","right_type":"update"},{"entity_type":"organizations","right_type":"delete"},{"entity_type":"departments","right_type":"read"},{"entity_type":"departments","right_type":"create"},{"entity_type":"departments","right_type":"update"},{"entity_type":"departments","right_type":"delete"},{"entity_type":"categories","right_type":"read"},{"entity_type":"categories","right_type":"create"},{"entity_type":"categories","right_type":"update"},{"entity_type":"categories","right_type":"delete"},{"entity_type":"dynamic_fields","right_type":"read"},{"entity_type":"dynamic_fields","right_type":"create"},{"entity_type":"dynamic_fields","right_type":"update"},{"entity_type":"dynamic_fields","right_type":"delete"},{"entity_type":"objects","right_type":"read"},{"entity_type":"objects","right_type":"create"},{"entity_type":"objects","right_type":"update"},{"entity_type":"objects","right_type":"delete"},{"entity_type":"roles","right_type":"read"},{"entity_type":"roles","right_type":"create"},{"entity_type":"roles","right_type":"update"},{"entity_type":"roles","right_type":"delete"},{"entity_type":"users","right_type":"read"},{"entity_type":"users","right_type":"create"},{"entity_type":"users","right_type":"update"},{"entity_type":"users","right_type":"delete"},{"entity_type":"posts","right_type":"read"},{"entity_type":"posts","right_type":"create"},{"entity_type":"posts","right_type":"update"},{"entity_type":"posts","right_type":"delete"}]))
                
        yield

    except Exception as e:
        print(e)
    finally:
        await engine.dispose()


app = FastAPI(lifespan=lifespan)


app.include_router(dep_router)
app.include_router(obj_router)
app.include_router(org_router)
app.include_router(roles_router)
app.include_router(users_router)
app.include_router(warehouse_router)

# Логгер

logger = logging.getLogger("app")



async def log_auth_event(
    user_id: int,
    username: str,
    action: str,
    request: Request
):
    """Log an authentication event"""
    async with AsyncSessionLocal() as db:

        auth_log = AuthLog(
            user_id=user_id,
            username=username,
            action=action,
            ip_address=request.client.host if request.client else "0.0.0.0",
            user_agent=request.headers.get("user-agent", "")
        )
        
        db.add(auth_log)
        await db.commit()



@app.get("/me")
async def read_users_me(request:Request):
    username = request.state.username
    user = await UserService.get_user_by_username(username)
    return user


async def user_audit(request: Request, call_next):
    try:
        # Skip authentication for public endpoints
        if request.url.path in PUBLIC_ENDPOINTS:
            return await call_next(request)
        
        if request.url.path.startswith("/documents/pdf"):
            return await call_next(request)

        # Get token from header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Not authenticated"},
            )

        token = auth_header.split(" ")[1]

        # Decode token
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        # Set user in request state
        request.state.username = username

        # Skip audit for non-user endpoints
        if not request.url.path.startswith('/users'):
            return await call_next(request)

        # Skip audit for safe methods
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return await call_next(request)

        return await audit_user_actions(request, call_next)

    except JWTError:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid token"},
        )
    except Exception as e:
        logger.error(f"Authentication middleware error: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )

async def audit_user_actions(request: Request, call_next):
    async with AsyncSessionLocal() as db:
        try:
            # Prepare audit data
            audit_data = {
                "method": request.method,
                "path": request.url.path,
                "timestamp": datetime.now(),
                "ip_address": request.client.host if request.client else None,
                "user_agent": request.headers.get('user-agent')
            }

            # Process request body
            body = await request.body()
            request.state.body = body
            if body:
                try:
                    audit_data["request_body"] = json.loads(body.decode())
                except json.JSONDecodeError:
                    audit_data["request_body"] = body.decode()
            # Get performer info with eager loading
            performer = await db.execute(
                select(User)
                .where(User.username == request.state.username)
                .options(selectinload(User.roles))
            )
            performer = performer.unique().scalar_one_or_none()
            performer_id = performer.id if performer else None

            # Process target user and old data
            target_user = None
            old_data = None
            
            if request.url.path != "/users/register" and "request_body" in audit_data and "id" in audit_data.get("request_body", {}):
                target_user = await db.execute(
                    select(User)
                    .where(User.id == audit_data["request_body"]["id"])
                    .options(selectinload(User.roles)))
                target_user = target_user.unique().scalar_one_or_none()
                
                if target_user:
                    old_data = {
                        "username": target_user.username,
                        "first_name": target_user.first_name,
                        "middle_name": target_user.middle_name,
                        "last_name": target_user.last_name,
                        "phone": target_user.phone,
                        "email": target_user.email
                    }

            # Call next middleware/endpoint
            response = await call_next(request)

            # Log successful actions
            if response.status_code < 400:
                action = {
                    'POST': 'CREATE',
                    'PUT': 'UPDATE',
                    'PATCH': 'UPDATE',
                    'DELETE': 'DELETE'
                }.get(request.method, request.method)
                
                log_entry = UserAudit(
                    user_id=target_user.id if target_user else None,
                    action=action,
                    entity_type="user",
                    entity_id=str(target_user.id) if target_user else None,
                    old_data=old_data,
                    new_data=audit_data["request_body"] if body else None,
                    performed_by=performer_id,
                    ip_address=audit_data["ip_address"],
                    user_agent=audit_data["user_agent"]
                )
                db.add(log_entry)
                await db.commit()

            return response

        except Exception as e:
            await db.rollback()
            logger.error(f"Audit error: {str(e)}")
            raise


app.middleware("http")(user_audit)



# Middleware для логгирования
@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.method in ["POST", "PATCH", "PUT"]:
        body = await request.body()
        logger.info(f"Request body: {body.decode()}")
    start_time = datetime.now()
    response = await call_next(request)
    process_time = datetime.now() - start_time
    if hasattr(response,"detail"):
        logger.info(f"Response status code: {response.status_code}, detail: {response.detail} Process time: {process_time}")
    else:
        logger.info(f"Response status code: {response.status_code}, Process time: {process_time}")
    return response

# CORS настройки
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Авторизация
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
PUBLIC_ENDPOINTS = ["/token","/docs", "/openapi.json","/user-logs/realtime"]



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def authenticate_user(username: str, password: str):
    async with AsyncSessionLocal() as db:
        user = await db.execute(select(User).filter_by(username=username))
        user = user.scalar_one_or_none()
        if not user or not verify_password(password, user.password):
            return None
        return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.getenv("SECRET_KEY"), algorithm=ALGORITHM)
    return encoded_jwt


@app.post("/token")
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        user = await authenticate_user(form_data.username, form_data.password)
        if not user:
            await log_auth_event(
                0,
                form_data.username,
                "failed_login",
                request
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        await log_auth_event(
            user.id,
            user.username,
            "login",
            request
        )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500,detail=str(e))


    




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app,host="127.0.0.1",port=8000)