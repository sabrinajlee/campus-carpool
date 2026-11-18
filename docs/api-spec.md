# API Specification

> **Status:** Auth endpoints implemented. Me, rides and ride requests: draft (the frontend already calls them through `frontend/src/api.js`).

## Conventions

- Base URL (local): `http://localhost:5001/api`
- Request and response bodies are JSON.
- **Auth: session cookie** (Flask-Login). After `POST /auth/login`, the browser stores a cookie and sends it automatically.
  From React, every call must use `credentials: "include"` (already done in `frontend/src/api.js`).
- 🔒 = login required. Without a session, the API returns `401 NOT_LOGGED_IN`.
- Every frontend call goes through `frontend/src/api.js` (auth calls through `frontend/src/auth/authApi.js`). Pages don't call `fetch` themselves.

### URLs

| Prefix | For | Examples |
|---|---|---|
| `/auth/*` | The session and account setup only | signup, verify, resend, login, logout, `GET /auth/me` |
| `/me/*` | The logged-in user's own data | `PATCH /me`, `/me/vehicle`, `/me/trips` |
| `/rides`, `/requests` | Rides, and the seat requests on them | `GET /rides/<id>`, `POST /rides/<id>/requests` |

- `GET /auth/me` answers "who is logged in". Changing your profile is `PATCH /me`, never under `/auth`.
- Collections are plural nouns. A request is created under its ride (`/rides/<id>/requests`) and then has its own URL (`/requests/<id>`).
- **Every status change is `PATCH /<resource>/<id>/<action>`** with no body: `cancel`, `accept`, `decline`, `remove`, `complete`. Each action checks who may do it and from which status, and sends its own email.
- A resource you have exactly one of is replaced with `PUT` (`PUT /me/vehicle`).
- Field names match the database columns (`price_per_seat`, `depart_at`).
- Times are ISO 8601 in UTC (`"2026-11-13T21:30:00Z"`). The frontend shows local time.

### Responses

Successful responses wrap the object in a named key: `{ "user": ... }`, `{ "ride": ... }`, `{ "rides": [...] }`, `{ "request": ... }`, `{ "requests": [...] }`, `{ "vehicle": ... }`. The functions in `api.js` unwrap it, so pages get the object itself.

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

## All endpoints

| Method | Endpoint | Description | `api.js` function | Used by | Auth |
|---|---|---|---|---|---|
| PATCH | `/me` | Update my name (onboarding only) and phone | `updateMe` | Basic information | 🔒 |
| GET | `/me/vehicle` | My vehicle, or `null` | `getMyVehicle` | Car details, Post a ride | 🔒 |
| PUT | `/me/vehicle` | Create or replace my vehicle | `saveMyVehicle` | Car details | 🔒 |
| GET | `/me/trips` | My trips: driving + riding | `getMyTrips` | My trips | 🔒 |
| GET | `/rides?destination=&date=` | Search open rides (hides full, cancelled, past) | `searchRides` | Explore | 🔒 |
| POST | `/rides` | Post a ride | `postRide` | Pickup & drop-off | 🔒 |
| GET | `/rides/<id>` | One ride | `getRide` | Ride details, Manage requests, every confirmation screen | 🔒 |
| PATCH | `/rides/<id>/cancel` | Cancel my ride (driver) | `cancelRide` | Manage requests | 🔒 |
| POST | `/rides/<id>/requests` | Request a seat | `requestSeat` | Ride details | 🔒 |
| GET | `/rides/<id>/requests` | Requests on my ride (driver) | `getRideRequests` | Manage requests | 🔒 |
| PATCH | `/requests/<id>/accept` | Accept a pending request (driver) | `acceptRequest` | Manage requests | 🔒 |
| PATCH | `/requests/<id>/decline` | Decline a pending request (driver) | `declineRequest` | Manage requests | 🔒 |
| PATCH | `/requests/<id>/remove` | Take an accepted rider off the ride (driver) | `removeRider` | Manage requests | 🔒 |
| PATCH | `/requests/<id>/cancel` | Cancel my request (rider) | `cancelRequest` | Ride details | 🔒 |
| PATCH | `/requests/<id>/complete` | Confirm my ride happened (rider) | `completeRequest` | Was your ride completed? | 🔒 |

Errors used by more than one endpoint:

| Status | Code | When |
|---|---|---|
| 400 | `MISSING_FIELDS` | A required field is empty or invalid |
| 403 | `FORBIDDEN` | Not your ride or request (e.g. a rider calling `/accept`) |
| 404 | `NOT_FOUND` | No ride or request with that id |
| 409 | `INVALID_STATUS` | The action isn't allowed from the current status (e.g. accepting a declined request) |

## Me (draft)

### PATCH `/me` 🔒

Updates the logged-in user. Only the fields sent are changed. `name` is accepted only while `phone` is still `null` (onboarding); after that the name is read-only.

**Request** `{ "name": "Jane Doe", "phone": "5195550123" }` · **200** `{ "user": { ...same as /auth/me... } }`

The frontend puts the returned user in `AuthContext`, which is how onboarding ends (`user.phone` is no longer `null`).

### GET / PUT `/me/vehicle` 🔒

**GET 200** `{ "vehicle": { "make": "Honda", "model": "Civic", "colour": "Silver", "plate": "CKRT 482", "seats": 3 } }` or `{ "vehicle": null }`

**PUT** takes the same fields (all required, `seats` 1 to 7) and returns **200** `{ "vehicle": {...} }`. `seats` is the default for new rides; Post a ride can change it per trip.

### GET `/me/trips` 🔒

```json
{
  "driving": [{ "id": 4, "origin": "London", "destination": "Toronto",
                "depart_at": "2026-11-13T21:30:00Z", "status": "open",
                "max_seats": 3, "pending_requests": 1, "passengers": ["Allen", "Bobby"] }],
  "riding":  [{ "id": 7, "request_id": 12, "request_status": "pending",
                "origin": "London", "destination": "Ottawa",
                "depart_at": "2026-11-20T13:00:00Z", "status": "open",
                "driver_name": "Jane Doe", "seats_left": 2 }]
}
```

- `id` is always the ride id. `request_id` and `request_status` are my request on that ride.
- `passengers`: names of riders whose request was accepted.
- `seats_left`: seats still open on the ride (shown on pending requests).

## Rides (draft)

### The ride object

Every endpoint that returns a ride uses this shape:

```json
{
  "id": 4, "origin": "London", "destination": "Toronto",
  "depart_at": "2026-11-13T21:30:00Z", "arrive_at": "2026-11-13T23:30:00Z",
  "pickup_point": "Masonville Mall", "dropoff_point": "Union Station",
  "max_seats": 3, "seats_left": 2, "price_per_seat": 25, "notes": null, "status": "open",
  "driver": { "id": 2, "name": "Alex Chen" },
  "my_request": { "id": 15, "status": "pending" }
}
```

- `arrive_at` is optional (`null` when the driver left it empty).
- `seats_left` = `max_seats` minus accepted requests.
- `my_request` is the logged-in user's request on this ride, or `null`. Ride details and Was your ride completed? use its `id` for `/cancel` and `/complete`.
- The driver's contact details and vehicle are added only for an accepted rider (see `docs/frontend.md`, Developer notes, Privacy).

### GET `/rides?destination=&date=` 🔒

Both filters are optional. `date` is `YYYY-MM-DD`. Returns **200** `{ "rides": [ride, ...] }`, soonest first, without full, cancelled or past rides.

### POST `/rides` 🔒

**Request**
```json
{ "origin": "London", "destination": "Toronto",
  "depart_at": "2026-11-13T21:30:00Z", "arrive_at": null,
  "max_seats": 3, "price_per_seat": 25,
  "pickup_point": "Masonville Mall", "dropoff_point": "Union Station", "notes": null }
```

**201** `{ "ride": {...} }`. The frontend then goes to `/rides/<id>/posted`.

| Status | Code | When |
|---|---|---|
| 400 | `MISSING_FIELDS` | A required field is empty, `depart_at` is in the past, `max_seats` isn't 1 to 7, or `price_per_seat` ≤ 0 |
| 409 | `NO_VEHICLE` | The user has no vehicle yet |

### GET `/rides/<id>` 🔒

**200** `{ "ride": {...} }` · **404** `NOT_FOUND`

### PATCH `/rides/<id>/cancel` 🔒

Driver only. Sets the ride to `cancelled` and emails every pending and accepted rider. **200** `{ "ride": {...} }`

## Ride requests (draft)

### POST `/rides/<id>/requests` 🔒

Asks for one seat. No body. Emails the driver. **201** `{ "request": { "id": 15, "ride_id": 4, "status": "pending" } }`

| Status | Code | When |
|---|---|---|
| 400 | `OWN_RIDE` | The driver asked for a seat on their own ride |
| 409 | `ALREADY_REQUESTED` | This rider already has a request on this ride |
| 409 | `RIDE_FULL` | No seats left, or the ride is cancelled or past |

### GET `/rides/<id>/requests` 🔒

Driver only. **200**
```json
{ "requests": [{ "id": 15, "status": "accepted",
                 "rider": { "id": 9, "name": "Iris Park", "email": "iris@uwo.ca", "phone": "5195550123" } }] }
```
`email` and `phone` are only included for accepted riders.

### Status changes

Each returns **200** `{ "request": {...} }`, or **409** `INVALID_STATUS` when the request isn't in the "From" status.

| Endpoint | Who | From | To | Also |
|---|---|---|---|---|
| `PATCH /requests/<id>/accept` | Driver | `pending` | `accepted` | Takes a seat (409 `RIDE_FULL` if none left; the last seat makes the ride `full`). Emails both. |
| `PATCH /requests/<id>/decline` | Driver | `pending` | `declined` | Emails the rider. |
| `PATCH /requests/<id>/remove` | Driver | `accepted` | `removed` | Gives the seat back. Emails the rider. |
| `PATCH /requests/<id>/cancel` | Rider | `pending`, `accepted` | `cancelled` | Gives the seat back if it was accepted. Emails the driver. |
| `PATCH /requests/<id>/complete` | Rider | `accepted`, after `depart_at` | `completed` | Saves the completion for ride history later. |

`removed` and `completed` aren't in the `ride_requests` status constraint yet (see `docs/erd.md`).
