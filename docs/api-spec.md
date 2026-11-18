# API Specification

> **Status:** Auth endpoints implemented. Rides and ride requests: draft.

## Conventions

- Base URL (local): `http://localhost:5001/api`
- Request and response bodies are JSON.
- **Auth: session cookie** (Flask-Login). After `POST /auth/login`, the browser stores a cookie and sends it automatically.
  From React, every call must use `credentials: "include"` (already done in `frontend/src/api.js`).
- 🔒 = login required. Without a session, the API returns `401 NOT_LOGGED_IN`.

### Error format

Every error looks like this:

```json
{ "error": { "code": "EMAIL_TAKEN", "message": "An account with this email already exists." } }
```

Show `message` to the user; use `code` in code to decide what to do.

## Auth

### POST `/auth/signup`

Creates an **unverified** account and sends a verification link.
(Until email sending is set up, the link is printed in the backend terminal.)

**Request**
```json
{ "name": "Jane Doe", "email": "jane@uwo.ca", "password": "atleast8chars" }
```

**201**
```json
{ "message": "Account created. Check your email to verify it.", "email": "jane@uwo.ca" }
```

| Status | Code | When |
|---|---|---|
| 400 | `MISSING_FIELDS` | name, email or password is empty |
| 400 | `INVALID_EMAIL_DOMAIN` | email is not `@uwo.ca` |
| 400 | `WEAK_PASSWORD` | password shorter than 8 characters |
| 409 | `EMAIL_TAKEN` | an account with this email already exists |

### GET `/auth/verify/<token>`

Opened from the link in the email (not called by React). Marks the account as verified and **redirects** to the frontend:

| Result | Redirects to |
|---|---|
| Verified | `/login?verify=success` |
| Link older than 24 hours | `/login?verify=expired` |
| Broken link | `/login?verify=invalid` |

The Login page reads `verify` from the URL to show a message.

### POST `/auth/resend`

Sends a new verification link.

**Request** `{ "email": "jane@uwo.ca" }`

**200** — always the same answer, so nobody can check which emails are registered:
```json
{ "message": "If that account needs verifying, a new link has been sent." }
```

### POST `/auth/login`

**Request**
```json
{ "email": "jane@uwo.ca", "password": "atleast8chars" }
```

**200** (sets the session cookie)
```json
{ "user": { "id": 1, "name": "Jane Doe", "email": "jane@uwo.ca", "is_verified": true, "contact_pref": "email", "phone": null } }
```

| Status | Code | When |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | wrong email or password |
| 403 | `EMAIL_NOT_VERIFIED` | account exists but email not verified yet (show a "Resend link" option) |

### POST `/auth/logout` 🔒

**200** `{ "message": "Logged out." }`

### GET `/auth/me` 🔒

Who is logged in right now. Call this when the app loads to know if the user is logged in.

**200** `{ "user": { ...same as login... } }` · **401** `NOT_LOGGED_IN`

## Rides (draft)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/rides?destination=&date=` | Search open rides (hides full, cancelled, past) | 🔒 |
| POST | `/rides` | Post a ride | 🔒 |
| GET | `/rides/<id>` | Ride details | 🔒 |
| PATCH | `/rides/<id>/cancel` | Cancel my ride (driver) | 🔒 |

## Ride requests (draft)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/rides/<id>/requests` | Request a seat | 🔒 |
| GET | `/rides/<id>/requests` | Requests on my ride (driver) | 🔒 |
| PATCH | `/requests/<id>` | Accept / decline a request, or remove a confirmed rider (driver) | 🔒 |
| PATCH | `/requests/<id>/cancel` | Cancel my request (rider) | 🔒 |
| GET | `/me/trips` | My trips: driving + riding | 🔒 |

### Who sees contact info

Phone, email and the vehicle are only returned once a request is **accepted**. A rider sees the driver's contact and vehicle; the driver sees each accepted rider's contact. Pending, declined and cancelled requests get `null` for these fields on both sides. The server enforces this; hiding them in the UI is not enough.

### GET `/rides/<id>` 🔒

One ride, as seen by the logged-in user. Used by Ride details for every viewer.

**200**
```json
{ "ride": {
    "id": 9, "origin": "London", "destination": "Toronto",
    "pickup_point": "Western University, London", "dropoff_point": "Union Station area, Toronto",
    "depart_at": "2026-11-13T21:30:00Z", "seats_left": 3, "price_per_seat": "15.00", "status": "open",
    "is_own": false,
    "my_request": { "id": 21, "status": "pending" },
    "driver": { "id": 10, "name": "Alex Morgan", "phone": null, "email": null },
    "vehicle": null
} }
```

- `is_own`: the logged-in user is the driver.
- `my_request`: the user's own request on this ride, or `null` (seen from Explore).
- `driver.phone`, `driver.email` and `vehicle` (`colour`, `make`, `model`, `plate`, `seats`): only when `my_request.status` is `accepted`, or for the driver themselves.

**404** the ride doesn't exist.

### GET `/rides/<id>/requests` 🔒

The driver's own ride only. Pending and accepted requests, for the Requests and Confirmed Riders lists.

**200**
```json
{ "requests": [
    { "id": 31, "status": "pending",  "rider": { "id": 20, "name": "Iris Lucky",  "phone": null, "email": null } },
    { "id": 32, "status": "accepted", "rider": { "id": 21, "name": "Alex Morgan", "phone": "(647) 787-9872", "email": "amorgan2@uwo.ca" } }
] }
```

**403** not the driver of this ride.

### POST `/rides/<id>/requests` 🔒

Request one seat. Creates a `pending` request and emails the driver.

**201** `{ "request": { "id": 21, "ride_id": 9, "status": "pending" } }`

| Status | Code | When |
|---|---|---|
| 409 | `ride_full` | no seats left |
| 409 | `ride_cancelled` | the driver cancelled the ride |
| 409 | `already_requested` | the user already has a request on this ride |

### PATCH `/requests/<id>` 🔒

The driver accepts or declines a pending request, or removes a confirmed rider (sets an accepted request to `declined`). Accepting lowers `seats_left` in one atomic step; removing gives the seat back. The rider is emailed.

**Request** `{ "status": "accepted" }` or `{ "status": "declined" }`

**200** `{ "request": { ...same shape as in GET /rides/<id>/requests... } }` (with the rider's contact once accepted)

| Status | Code | When |
|---|---|---|
| 403 | | not the driver of this ride |
| 409 | `no_seats_left` | another accept took the last seat; the request stays pending |

### PATCH `/requests/<id>/cancel` 🔒

The rider cancels their own pending or accepted request. An accepted seat goes back on the ride, and the driver is emailed.

**200** `{ "request": { "id": 21, "status": "cancelled" } }`

### PATCH `/rides/<id>/cancel` 🔒

The driver cancels their own ride. It's hidden from Explore, and every pending and accepted rider is emailed.

**200** `{ "ride": { "id": 9, "status": "cancelled" } }`
