# 0002 — API URL conventions

**Status:** Accepted
**Date:** 2026-11-18

## Context
Pages were written before the rides and requests endpoints existed, and each one guessed its own URL. The result was a mix: profile changes under `/api/auth/me` but the vehicle and trips under `/api/me/...`, a `POST /rides` call missing the `/api` prefix, accept/decline as `PATCH /requests/<id> { status }` while cancel was `PATCH /requests/<id>/cancel`, and pages calling `fetch` directly instead of going through `api.js`.

## Options
1. Move everything about the user to `/api/me` (including `GET /auth/me`): one prefix, but changes auth code that is already built and working.
2. Keep `/api/auth/*` for the session only, and put the user's own data under `/api/me/*`: no change to the built auth code, and each prefix has one job.
3. Status changes as `PATCH /requests/<id> { "status": ... }`: one endpoint, but permissions, allowed transitions and emails all depend on the value sent.
4. Status changes as `PATCH /<resource>/<id>/<action>`: one endpoint per action, each with its own permission check and email.

## Decision
Options 2 and 4. The full list is in `docs/api-spec.md`:

- `/api/auth/*`: signup, verify, resend, login, logout, and `GET /auth/me` (who is logged in).
- `/api/me/*`: `PATCH /me`, `GET`/`PUT /me/vehicle`, `GET /me/trips`.
- `/api/rides` and `/api/requests`: plural nouns. Status changes are `PATCH .../<action>` (`cancel`, `accept`, `decline`, `remove`, `complete`).
- `PUT` for a resource the user has exactly one of (the vehicle).
- Responses wrap the object in a named key (`{ "ride": ... }`), and `api.js` unwraps it.
- Every frontend call is a function in `frontend/src/api.js`.

## Reasons
- The working auth code stays untouched.
- Every status change already reads as an action in the UI (Accept, Decline, Remove, Cancel, Completed!), and each has different rules and emails, so separate endpoints keep each backend handler small.
- One client file means a wrong URL is fixed in one place.

## Consequences
- New endpoints follow the same prefixes and the `PATCH .../<action>` pattern.
- `GET /auth/me` and `PATCH /me` live under different prefixes; `api-spec.md` explains why.
- The database needs `removed` and `completed` request statuses, `rides.arrive_at` and a `vehicles` table (listed in `docs/erd.md`).
