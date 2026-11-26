from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

from app.errors import error_response
from app.extensions import db
from app.models import Ride

api_bp = Blueprint("api", __name__)

MIN_SEATS = 1
MAX_SEATS = 7
MAX_PRICE = Decimal("999999.99")  # largest value rides.price_per_seat (Numeric(8, 2)) can hold


@api_bp.get("/health")
def health():
    return jsonify({"status": "ok"})


# ---------- helpers ----------

def _json_body():
    return request.get_json(silent=True) or {}


def _invalid(message):
    return error_response(400, "MISSING_FIELDS", message)


def _clean_text(value):
    """Trimmed string, or "" for anything that isn't a string."""
    return value.strip() if isinstance(value, str) else ""


def _parse_time(value):
    """ISO 8601 string → timezone-aware datetime, or None if missing or invalid.
    A time without a time zone is treated as UTC."""
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        parsed = datetime.fromisoformat(value.strip())
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def _iso(value):
    """datetime → "2026-11-13T21:30:00Z" (UTC), as in docs/api-spec.md."""
    if value is None:
        return None
    return value.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _parse_seats(value):
    """Whole number from 1 to 7, or None."""
    if isinstance(value, bool) or not isinstance(value, int):
        return None
    return value if MIN_SEATS <= value <= MAX_SEATS else None


def _ride_to_dict(ride, viewer):
    """The ride object from docs/api-spec.md, as seen by `viewer`.
    Driver contact and vehicle are only filled in for the driver and accepted riders."""
    accepted = sum(1 for r in ride.ride_requests if r.status == "accepted")
    is_own = ride.driver_id == viewer.id
    mine = next((r for r in ride.ride_requests if r.rider_id == viewer.id), None)
    can_see_contact = is_own or (mine is not None and mine.status == "accepted")
    driver = ride.driver

    return {
        "id": ride.id,
        "origin": ride.origin,
        "destination": ride.destination,
        "depart_at": _iso(ride.depart_at),
        "arrive_at": _iso(ride.arrive_at),
        "pickup_point": ride.pickup_point,
        "dropoff_point": ride.dropoff_point,
        "max_seats": ride.max_seats,
        "seats_left": max(ride.max_seats - accepted, 0),
        "price_per_seat": f"{ride.price_per_seat:.2f}",
        "notes": ride.notes,
        "status": ride.status,
        "is_own": is_own,
        "my_request": {"id": mine.id, "status": mine.status} if mine else None,
        "driver": {
            "id": driver.id,
            "name": driver.name,
            "phone": driver.phone if can_see_contact else None,
            "email": driver.email if can_see_contact else None,
        },
        "vehicle": driver.vehicle.to_dict() if can_see_contact and driver.vehicle else None,
    }


# ---------- rides ----------

@api_bp.post("/rides")
@login_required
def post_ride():
    if current_user.vehicle is None:
        return error_response(409, "NO_VEHICLE", "Add your vehicle before posting a ride.")

    data = _json_body()
    origin = _clean_text(data.get("origin"))
    destination = _clean_text(data.get("destination"))
    pickup_point = _clean_text(data.get("pickup_point"))
    dropoff_point = _clean_text(data.get("dropoff_point"))
    notes = _clean_text(data.get("notes")) or None
    depart_at = _parse_time(data.get("depart_at"))
    max_seats = _parse_seats(data.get("max_seats"))

    if not origin or not destination or not pickup_point or not dropoff_point:
        return _invalid("Origin, destination, pickup and drop-off are required.")
    if len(origin) > 120 or len(destination) > 120:
        return _invalid("Origin and destination can be up to 120 characters.")
    if len(pickup_point) > 200 or len(dropoff_point) > 200:
        return _invalid("Pickup and drop-off can be up to 200 characters.")
    if notes and len(notes) > 500:
        return _invalid("Trip details can be up to 500 characters.")
    if origin.lower() == destination.lower():
        return _invalid("Destination must be different from where you're leaving.")

    if depart_at is None:
        return _invalid("Add a valid departure time.")
    if depart_at <= datetime.now(timezone.utc):
        return _invalid("Departure must be in the future.")

    arrive_at = None
    if data.get("arrive_at") not in (None, ""):
        arrive_at = _parse_time(data.get("arrive_at"))
        if arrive_at is None:
            return _invalid("Add a valid arrival time, or leave it empty.")
        if arrive_at <= depart_at:
            return _invalid("Arrival must be after departure.")

    if max_seats is None:
        return _invalid(f"Seats must be a whole number from {MIN_SEATS} to {MAX_SEATS}.")

    raw_price = data.get("price_per_seat")
    try:
        if isinstance(raw_price, bool):
            raise InvalidOperation
        price = Decimal(str(raw_price))
    except (InvalidOperation, ValueError):
        return _invalid("Price per seat must be a number.")
    if not price.is_finite() or price <= 0:
        return _invalid("Price must be more than $0.")
    if price > MAX_PRICE:
        return _invalid("Price per seat is too high.")
    if price != price.quantize(Decimal("0.01")):
        return _invalid("Use at most 2 decimal places for the price.")

    ride = Ride(
        driver_id=current_user.id,
        origin=origin,
        destination=destination,
        depart_at=depart_at,
        arrive_at=arrive_at,
        pickup_point=pickup_point,
        dropoff_point=dropoff_point,
        max_seats=max_seats,
        price_per_seat=price,
        notes=notes,
        status="open",
    )
    db.session.add(ride)
    db.session.commit()

    return jsonify({"ride": _ride_to_dict(ride, current_user)}), 201


@api_bp.get("/rides/<int:ride_id>")
@login_required
def get_ride(ride_id):
    ride = db.session.get(Ride, ride_id)
    if ride is None:
        return error_response(404, "NOT_FOUND", "That ride doesn't exist.")
    return jsonify({"ride": _ride_to_dict(ride, current_user)}), 200
