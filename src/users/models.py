from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, TIMESTAMP, Text, func
from sqlalchemy.types import LargeBinary
from sqlalchemy.orm import relationship
from src.database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"))
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="SET NULL"))
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    middle_name = Column(String(255))
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    password_hash = Column(LargeBinary, nullable=False)
    status = Column(Boolean, nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    hired_at = Column(TIMESTAMP)
    is_system = Column(Boolean)

    department = relationship("Department", back_populates="users")
    post = relationship("Post", back_populates="users")

    def set_password(self, password: str):
        """Хеширует пароль и сохраняет его как байты в базе данных."""
        self.password_hash = pwd_context.hash(password).encode('utf-8')

    def verify_password(self, password: str) -> bool:
        """Проверяет пароль пользователя."""
        return pwd_context.verify(password, self.password_hash.decode('utf-8'))


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    users = relationship("User", back_populates="post")
