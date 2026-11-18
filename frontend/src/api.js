import { mockGetRide, mockRequestSeat, mockSearchRides } from "./mocks/rides.js";

const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// Changed (P11 Ride details): apiGet now throws an ApiError, like apiPost and apiPatch.
// Before, it threw a plain Error with only a message, so pages couldn't tell a 404
// (ride doesn't exist -> go to /error) from a network or server failure (show Retry).
// Now callers can check err.status and err.code.
// Successful responses work the same as before, so existing callers like
// getMyTrips don't need changes.
export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
        res.status,
        data.error?.code ?? "UNKNOWN",
        data.error?.message ?? `GET ${path} failed: ${res.status}`
    );
  }
  return data;
}

export const getMyTrips = () => apiGet("/api/me/trips");


export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data.error?.code ?? "UNKNOWN",
      data.error?.message ?? "Something went wrong. Please try again."
    );
  }
  return data;
}

// Car details. PROPOSED endpoints: not in docs/api-spec.md or the backend yet.
// GET returns { vehicle: {...} | null }. POST saves the vehicle (make, model, colour, plate, seats).
export const getMyVehicle = () => apiGet("/api/me/vehicle");
export const saveMyVehicle = (vehicle) => apiPost("/api/me/vehicle", vehicle);

// Was your ride completed? GET /rides/<id> is in docs/api-spec.md (draft).
// PROPOSED: PATCH /requests/<id>/complete marks my accepted request as completed.
// Not in docs/api-spec.md or the backend yet, and needs request status `completed`.
async function apiPatch(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data.error?.code ?? "UNKNOWN",
      data.error?.message ?? "Something went wrong. Please try again."
    );
  }
  return data;
}

// GET /api/rides/<id> returns { "ride": {...} } (same wrapping as { "user": ... }); this returns the ride itself.
export const getRide = (id) =>
    USE_MOCKS
        ? mockGetRide(id)
        : apiGet(`/api/rides/${id}`).then((data) => data.ride);
export const completeRequest = (requestId) => apiPatch(`/api/requests/${requestId}/complete`);

// P9 Explore. Proposed, not in the backend yet:
// GET /api/rides?destination=&departs_after=&departs_before=  ->  { rides: [...] }
export async function searchRides({ destination = "", departsAfter, departsBefore } = {}) {
  if (USE_MOCKS) return mockSearchRides({ destination, departsAfter, departsBefore });
  const params = new URLSearchParams();
  if (destination) params.set("destination", destination);
  if (departsAfter) params.set("departs_after", departsAfter);
  if (departsBefore) params.set("departs_before", departsBefore);
  const qs = params.toString();
  const data = await apiGet(`/api/rides${qs ? `?${qs}` : ""}`);
  return data.rides;
}

// P11 Request a seat. Proposed, not in the backend yet:
// POST /api/rides/:id/requests  ->  201 { request: {...} }
// Error codes: ride_full, ride_cancelled, already_requested
export async function requestSeat(rideId) {
  if (USE_MOCKS) return mockRequestSeat(rideId);
  const data = await apiPost(`/api/rides/${rideId}/requests`, {});
  return data.request;
}