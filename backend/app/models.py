from datetime import datetime, timezone

from app.extensions import db


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"  # "user" is a reserved word in PostgreSQL

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_verified = db.Column(db.Boolean, nullable=False, default=False)
    contact_pref = db.Column(db.String(10), nullable=False, default="email")
    phone = db.Column(db.String(30))
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    rides = db.relationship("Ride", back_populates="driver")
    ride_requests = db.relationship("RideRequest", back_populates="rider")

    __table_args__ = (
        db.CheckConstraint("contact_pref IN ('email', 'phone')", name="ck_users_contact_pref"),
    )

    def __repr__(self):
        return f"<User {self.email}>"


class Ride(db.Model):
    __tablename__ = "rides"

    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    origin = db.Column(db.String(120), nullable=False)
    destination = db.Column(db.String(120), nullable=False)
    depart_at = db.Column(db.DateTime(timezone=True), nullable=False)
    pickup_point = db.Column(db.String(200), nullable=False)
    dropoff_point = db.Column(db.String(200), nullable=False)
    max_seats = db.Column(db.Integer, nullable=False)
    price_per_seat = db.Column(db.Numeric(8, 2), nullable=False)
    notes = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=False, default="open")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    driver = db.relationship("User", back_populates="rides")
    ride_requests = db.relationship(
        "RideRequest", back_populates="ride", cascade="all, delete-orphan"
    )

    __table_args__ = (
        db.CheckConstraint("max_seats >= 1", name="ck_rides_max_seats"),
        db.CheckConstraint("price_per_seat >= 0", name="ck_rides_price"),
        db.CheckConstraint(
            "status IN ('open', 'full', 'cancelled', 'completed')", name="ck_rides_status"
        ),
        db.Index("ix_rides_destination_depart_at", "destination", "depart_at"),
    )

    def __repr__(self):
        return f"<Ride {self.id} {self.origin} -> {self.destination}>"


class RideRequest(db.Model):
    __tablename__ = "ride_requests"

    id = db.Column(db.Integer, primary_key=True)
    ride_id = db.Column(db.Integer, db.ForeignKey("rides.id"), nullable=False)
    rider_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    ride = db.relationship("Ride", back_populates="ride_requests")
    rider = db.relationship("User", back_populates="ride_requests")

    __table_args__ = (
        db.UniqueConstraint("ride_id", "rider_id", name="uq_ride_requests_ride_rider"),
        db.CheckConstraint(
            "status IN ('pending', 'accepted', 'declined', 'cancelled')",
            name="ck_ride_requests_status",
        ),
    )

    def __repr__(self):
        return f"<RideRequest ride={self.ride_id} rider={self.rider_id} {self.status}>"
