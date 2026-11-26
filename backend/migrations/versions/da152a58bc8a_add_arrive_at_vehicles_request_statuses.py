"""add arrive_at, vehicles, request statuses, tighter ride checks

Revision ID: da152a58bc8a
Revises: b6b17295e034
Create Date: 2026-11-25 20:50:00.000000

Written by hand: Alembic's autogenerate does not detect changed CHECK
constraints, so the seat, price and status checks are dropped and recreated here.

- rides.arrive_at (optional), must be after depart_at
- rides.max_seats 1 to 7 (was >= 1)
- rides.price_per_seat > 0 (was >= 0)
- rides.notes limited to 500 characters (was unlimited text)
- ride_requests.status also allows 'removed' and 'completed'
- new vehicles table, one per user
- indexes on rides.driver_id and ride_requests.rider_id (for My trips)
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'da152a58bc8a'
down_revision = 'b6b17295e034'
branch_labels = None
depends_on = None


OLD_REQUEST_STATUSES = "status IN ('pending', 'accepted', 'declined', 'cancelled')"
NEW_REQUEST_STATUSES = (
    "status IN ('pending', 'accepted', 'declined', 'cancelled', 'removed', 'completed')"
)


def upgrade():
    # ---------- rides ----------
    op.add_column('rides', sa.Column('arrive_at', sa.DateTime(timezone=True), nullable=True))
    op.create_check_constraint(
        'ck_rides_arrive_after_depart', 'rides', 'arrive_at IS NULL OR arrive_at > depart_at'
    )

    op.drop_constraint('ck_rides_max_seats', 'rides', type_='check')
    op.create_check_constraint('ck_rides_max_seats', 'rides', 'max_seats BETWEEN 1 AND 7')

    op.drop_constraint('ck_rides_price', 'rides', type_='check')
    op.create_check_constraint('ck_rides_price', 'rides', 'price_per_seat > 0')

    # Fails if a row already has notes longer than 500 characters (none expected yet)
    op.alter_column(
        'rides', 'notes',
        existing_type=sa.Text(), type_=sa.String(length=500), existing_nullable=True,
    )

    op.create_index('ix_rides_driver_id', 'rides', ['driver_id'], unique=False)

    # ---------- ride_requests ----------
    op.drop_constraint('ck_ride_requests_status', 'ride_requests', type_='check')
    op.create_check_constraint('ck_ride_requests_status', 'ride_requests', NEW_REQUEST_STATUSES)

    op.create_index('ix_ride_requests_rider_id', 'ride_requests', ['rider_id'], unique=False)

    # ---------- vehicles ----------
    op.create_table(
        'vehicles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('make', sa.String(length=50), nullable=False),
        sa.Column('model', sa.String(length=50), nullable=False),
        sa.Column('colour', sa.String(length=30), nullable=False),
        sa.Column('plate', sa.String(length=10), nullable=False),
        sa.Column('seats', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('seats BETWEEN 1 AND 7', name='ck_vehicles_seats'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )


def downgrade():
    op.drop_table('vehicles')

    op.drop_index('ix_ride_requests_rider_id', table_name='ride_requests')
    # Fails if any request is 'removed' or 'completed'; change those rows first
    op.drop_constraint('ck_ride_requests_status', 'ride_requests', type_='check')
    op.create_check_constraint('ck_ride_requests_status', 'ride_requests', OLD_REQUEST_STATUSES)

    op.drop_index('ix_rides_driver_id', table_name='rides')
    op.alter_column(
        'rides', 'notes',
        existing_type=sa.String(length=500), type_=sa.Text(), existing_nullable=True,
    )

    op.drop_constraint('ck_rides_price', 'rides', type_='check')
    op.create_check_constraint('ck_rides_price', 'rides', 'price_per_seat >= 0')

    op.drop_constraint('ck_rides_max_seats', 'rides', type_='check')
    op.create_check_constraint('ck_rides_max_seats', 'rides', 'max_seats >= 1')

    op.drop_constraint('ck_rides_arrive_after_depart', 'rides', type_='check')
    op.drop_column('rides', 'arrive_at')
