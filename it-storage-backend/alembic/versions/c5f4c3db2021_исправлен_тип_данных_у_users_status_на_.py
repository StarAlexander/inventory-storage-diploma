"""Исправлен тип данных у Users.status на Boolean

Revision ID: c5f4c3db2021
Revises: 7ac44a99df7b
Create Date: 2024-12-09 22:24:41.614024

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c5f4c3db2021'
down_revision: Union[str, None] = '7ac44a99df7b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
