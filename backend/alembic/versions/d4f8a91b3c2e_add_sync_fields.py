"""add sync fields to holdings and broker_accounts

Revision ID: d4f8a91b3c2e
Revises: c994ae0789ed
Create Date: 2026-06-11
"""
from alembic import op
import sqlalchemy as sa

revision = 'd4f8a91b3c2e'
down_revision = 'c994ae0789ed'
branch_labels = None
depends_on = None


def upgrade():
    # Holdings — new columns
    op.add_column('holdings', sa.Column('broker_account_id',
        sa.Integer(), sa.ForeignKey('broker_accounts.id'), nullable=True))
    op.add_column('holdings', sa.Column('source',
        sa.String(), nullable=True, server_default='manual'))
    op.add_column('holdings', sa.Column('day_change',
        sa.Float(), nullable=True, server_default='0'))
    op.add_column('holdings', sa.Column('day_change_pct',
        sa.Float(), nullable=True, server_default='0'))
    op.add_column('holdings', sa.Column('product_type',
        sa.String(), nullable=True))
    op.add_column('holdings', sa.Column('last_synced_at',
        sa.DateTime(timezone=True), nullable=True))
    op.add_column('holdings', sa.Column('updated_at',
        sa.DateTime(timezone=True), nullable=True))

    # BrokerAccounts — new columns
    op.add_column('broker_accounts', sa.Column('auto_sync_enabled',
        sa.Boolean(), nullable=True, server_default='true'))
    op.add_column('broker_accounts', sa.Column('last_synced_at',
        sa.DateTime(timezone=True), nullable=True))
    op.add_column('broker_accounts', sa.Column('sync_error',
        sa.String(), nullable=True))
    op.add_column('broker_accounts', sa.Column('created_at',
        sa.DateTime(timezone=True), nullable=True))
    op.add_column('broker_accounts', sa.Column('updated_at',
        sa.DateTime(timezone=True), nullable=True))


def downgrade():
    for col in ['broker_account_id','source','day_change','day_change_pct',
                'product_type','last_synced_at','updated_at']:
        op.drop_column('holdings', col)
    for col in ['auto_sync_enabled','last_synced_at','sync_error','created_at','updated_at']:
        op.drop_column('broker_accounts', col)
