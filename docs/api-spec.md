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
| PATCH | `/requests/<id>` | Accept / decline (driver) | 🔒 |
| PATCH | `/requests/<id>/cancel` | Cancel my request (rider) | 🔒 |
| GET | `/me/trips` | My trips: driving + riding | 🔒 |
