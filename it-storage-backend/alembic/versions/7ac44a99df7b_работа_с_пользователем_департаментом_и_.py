"""Работа с пользователем, департаментом и организацией

Revision ID: 7ac44a99df7b
Revises: 
Create Date: 2024-12-09 22:09:07.327203

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7ac44a99df7b'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
