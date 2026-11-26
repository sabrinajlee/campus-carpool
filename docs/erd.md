# Database Design (ERD)

> **Status:** Implemented in `backend/app/models.py` (migrations `b6b17295e034` and `da152a58bc8a`, Nov 2026)

```mermaid
erDiagram
    USERS ||--o{ RIDES : "posts (as driver)"
    USERS ||--o{ RIDE_REQUESTS : "sends (as rider)"
    RIDES ||--o{ RIDE_REQUESTS : has
    USERS ||--o| VEHICLES : owns

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        boolean is_verified
        string contact_pref
        string phone
        datetime created_at
    }

    RIDES {
        int id PK
        int driver_id FK
        string origin
        string destination
        datetime depart_at
        datetime arrive_at
        string pickup_point
        string dropoff_point
        int max_seats
        decimal price_per_seat
        string notes
        string status
        datetime created_at
    }

    RIDE_REQUESTS {
        int id PK
        int ride_id FK
        int rider_id FK
        string status
        datetime created_at
    }

    VEHICLES {
        int id PK
        int user_id FK, UK
        string make
        string model
        string colour
        string plate
        int seats
        datetime created_at
        datetime updated_at
    }
```

## Status Values

| Table | Field | Values | Default |
|---|---|---|---|
| `users` | `contact_pref` | `email`, `phone` | `email` |
| `rides` | `status` | `open`, `full`, `cancelled`, `completed` | `open` |
| `ride_requests` | `status` | `pending`, `accepted`, `declined`, `cancelled`, `removed`, `completed` | `pending` |

## Constraints

Enforced by the database:

- `users.email` is unique
- `(ride_requests.ride_id, ride_requests.rider_id)` is unique: a rider can request the same ride only once
- `rides.max_seats` and `vehicles.seats` are 1 to 7
- `rides.price_per_seat` > 0 (no maximum)
- `rides.arrive_at` is empty or after `depart_at`
- `vehicles.user_id` is unique: one vehicle per user. Plates are not unique (people share cars).
- Text lengths: `origin`/`destination` 120, `pickup_point`/`dropoff_point` 200, `notes` 500, `make`/`model` 50, `colour` 30, `plate` 10
- Status and `contact_pref` columns only accept the values above

Enforced in application code (not possible as a simple DB constraint):

- A driver cannot request a seat on their own ride
- Accepted requests for a ride ≤ `rides.max_seats` (check + update in one transaction)
- Rides with `depart_at` in the past are hidden from search

## Notes

- Table is `users`, not `user`: `user` is a reserved word in PostgreSQL.
- Model is `RideRequest`, not `Request`, to avoid confusion with Flask's `request`.
- Pricing is per seat only for the MVP (split pricing is a later feature).
- Rides have no `vehicle_id`: a ride shows the driver's current vehicle.
- Times are stored with time zone (`timestamptz`).

## Changing the schema

1. Edit `backend/app/models.py`
2. `flask --app wsgi db migrate -m "describe the change"`
3. Check the new file in `migrations/versions/`
4. `flask --app wsgi db upgrade`
5. Commit the model change **and** the migration file in the same PR, and update this doc
