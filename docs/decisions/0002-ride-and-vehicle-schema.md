# 0002 — Ride and vehicle schema rules

**Status:** Accepted
**Date:** 2026-11-25

## Context
Posting a ride needs columns and a table the first migration didn't have: an estimated arrival time, and a vehicle (`POST /rides` returns `409 NO_VEHICLE` without one). The driver-removes-rider and rider-confirms-trip actions need two more request statuses. The first migration's checks also didn't match the API spec and forms: it allowed a $0 price and any number of seats.

Migration `da152a58bc8a` adds these. This record covers the choices made in it.

## Options
1. **Which car a ride uses**
   - Store `vehicle_id` on each ride: past rides keep the car they used, but needs a "pick a car" step and only helps if users can have several cars.
   - Show the driver's current vehicle: simple, matches one vehicle per user, but editing the car changes it on every ride.
2. **Plate uniqueness**
   - Unique across users: blocks duplicates, but two people who share a car can't both add it, and a typo can lock someone out.
   - Not unique.
3. **Price per seat**
   - `>= 0` (free rides allowed), `> 0`, or `> 0` with a maximum to catch typos.

## Decision
- Rides have no `vehicle_id`; a ride shows the driver's current vehicle. One vehicle per user (`vehicles.user_id` unique).
- Licence plates are not unique.
- `price_per_seat > 0`, no maximum.
- `max_seats` and `vehicles.seats` are 1 to 7.
- `arrive_at` is optional; when set it must be after `depart_at`.
- `ride_requests.status` adds `removed` and `completed`.
- Text limits: `notes` 500, `make`/`model` 50, `colour` 30, `plate` 10. Forms have matching `maxLength`.
- Indexes on `rides.driver_id` and `ride_requests.rider_id` for My trips.

## Reasons
- The rules match `docs/api-spec.md` and the frontend validation, so the database rejects what the forms already reject.
- One vehicle per user is what the API (`GET`/`PUT /me/vehicle`) and Car details page are built around.
- Shared cars are common among students, so plate uniqueness would cause more problems than it prevents.
- Free rides aren't a feature; `> 0` matches the form. A maximum was left out to avoid guessing a fair limit.

## Consequences
- Rules are enforced even if a bug in the API skips validation.
- Alembic's autogenerate doesn't detect changed CHECK constraints, so future changes to them must be written into the migration by hand (drop and recreate), as `da152a58bc8a` does.
- Supporting several cars per user later would need a new migration (`vehicle_id` on rides, drop the unique `user_id`).
- Downgrading this migration fails if any request is `removed` or `completed`; change those rows first.
- Teammates must run `flask --app wsgi db upgrade` after pulling. It fails on their machine if their test data breaks the new rules (for example a $0 price or 8 seats).
