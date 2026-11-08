# API Specification

> **Status:** Draft — endpoints will change as the design is finalized

## Conventions

- Base URL: `/api`
- Request and response bodies are JSON.
- Auth: session-based login (TBD). 🔒 = login required.

### Error format

```json
{ "error": { "code": "RIDE_FULL", "message": "No seats left on this ride." } }
```

### Status codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Invalid input |
| 401 | Not logged in |
| 403 | Not allowed (e.g. not the driver) |
| 404 | Not found |
| 409 | Conflict (e.g. duplicate booking, ride full) |

## Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/signup` | Create unverified account, send verification email | — |
| GET | `/auth/verify/{token}` | Verify email | — |
| POST | `/auth/resend` | Resend verification email | — |
| POST | `/auth/login` | Log in | — |
| POST | `/auth/logout` | Log out | 🔒 |
| POST | `/auth/forgot` | Send password reset email | — |
| POST | `/auth/reset/{token}` | Set new password | — |

### Users

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/users/me` | My profile | 🔒 |
| PATCH | `/users/me` | Update profile | 🔒 |

### Rides

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/rides?destination=&date=` | Search open rides | 🔒 |
| POST | `/rides` | Post a ride | 🔒 |
| GET | `/rides/{id}` | Ride details | 🔒 |
| PATCH | `/rides/{id}/cancel` | Cancel my ride (driver) | 🔒 |
| GET | `/rides/mine` | Rides I'm driving | 🔒 |

### Bookings

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/rides/{id}/bookings` | Request a seat | 🔒 |
| GET | `/rides/{id}/bookings` | Requests on my ride (driver) | 🔒 |
| PATCH | `/bookings/{id}` | Accept / decline (driver) | 🔒 |
| PATCH | `/bookings/{id}/cancel` | Cancel my booking (rider) | 🔒 |
| GET | `/bookings/mine` | Rides I'm riding | 🔒 |

## Endpoint Details

Fill in one block per endpoint as it's implemented.

### POST `/rides`

**Request**
```json
{
  "origin": "London, ON",
  "destination": "Toronto, ON",
  "depart_at": "2026-12-18T14:00:00",
  "pickup_point": "UCC",
  "dropoff_point": "Union Station",
  "max_seats": 3,
  "pricing_type": "per_seat",
  "price": 20.00,
  "notes": "One suitcase per person"
}
```

**Response — 201**
```json
{ "id": 42, "status": "open", "seats_left": 3, "...": "..." }
```

**Errors:** `400` missing/invalid fields, past date, `max_seats < 1` · `401` not logged in

---

_Template for new endpoints:_

```markdown
### METHOD `/path`
**Auth:** yes/no
**Request:** (params / body)
**Response — 2xx:** (body)
**Errors:** (status — reason)
```
