from sqlalchemy import Column, Integer, String
from sqlalchemy.types import LargeBinary
from src.database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(255), unique=True, index=True)
    password_hash = Column(LargeBinary, nullable=False)

    def set_password(self, password: str):
        """Хеширует пароль и сохраняет его как байты в базе данных."""
        self.password_hash = pwd_context.hash(password).encode('utf-8')

    def verify_password(self, password: str) -> bool:
        """Проверяет пароль пользователя."""
        return pwd_context.verify(password, self.password_hash.decode('utf-8'))
