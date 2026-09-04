"""Initial schema

Revision ID: 146d56fe1c33
Revises: 
Create Date: 2026-07-06 15:34:01.327647

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '146d56fe1c33'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Original (pre-normalization) blogs table. The follow-up migration
    # (49a7fe414afe) drops the category/categories/points columns after
    # extracting them into their own normalized tables.
    op.create_table(
        'blogs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('date', sa.String(), nullable=True),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('image', sa.String(), nullable=True),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('points', sa.String(), nullable=True),
        sa.Column('categories', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_blogs_id'), 'blogs', ['id'], unique=False)
    op.create_index(op.f('ix_blogs_title'), 'blogs', ['title'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_blogs_title'), table_name='blogs')
    op.drop_index(op.f('ix_blogs_id'), table_name='blogs')
    op.drop_table('blogs')
