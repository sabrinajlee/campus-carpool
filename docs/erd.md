# Database Design (ERD)

> **Status:** Draft — names and fields may change

```mermaid
erDiagram
    USER ||--o{ RIDE : "posts (as driver)"
    USER ||--o{ BOOKING : "requests (as rider)"
    RIDE ||--o{ BOOKING : has

    USER {
        int id PK
        string name
        string email UK
        string password_hash
        boolean is_verified
        string photo_url
        string contact_pref
        string phone
        datetime created_at
    }

    RIDE {
        int id PK
        int driver_id FK
        string origin
        string destination
        datetime depart_at
        string pickup_point
        string dropoff_point
        int max_seats
        string pricing_type
        decimal price
        string notes
        string status
        datetime created_at
    }

    BOOKING {
        int id PK
        int ride_id FK
        int rider_id FK
        string status
        datetime created_at
    }
```

## Status Values

| Table | Field | Values |
|---|---|---|
| RIDE | `status` | `open`, `full`, `cancelled`, `completed` |
| RIDE | `pricing_type` | `per_seat`, `split` |
| BOOKING | `status` | `pending`, `accepted`, `declined`, `cancelled` |
| USER | `contact_pref` | `email`, `phone`, `in_app` |

## Constraints

- `USER.email` is unique.
- `(BOOKING.ride_id, BOOKING.rider_id)` is unique — no duplicate requests.
- `RIDE.max_seats` ≥ 1.
- Accepted bookings for a ride ≤ `max_seats`.
- `BOOKING.rider_id` ≠ `RIDE.driver_id`.

## Seed Data

_TBD: script to create sample users and rides for local testing and the demo._
