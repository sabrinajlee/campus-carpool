import { mockGetRide, mockRequestSeat, mockSearchRides } from "./mocks/rides.js";

// Every backend call goes through this file (auth calls are in auth/authApi.js).
// URL conventions, bodies, response shapes and error codes: docs/api-spec.md.
// The functions unwrap the response key ({ ride } → ride), and every call throws
// ApiError, so pages can check err.status (404 → /error) and err.code ("RIDE_FULL").

const API_URL = import.meta.env.VITE_API_URL;

// VITE_USE_MOCKS=true answers searchRides, getRide and requestSeat from src/mocks/rides.js,
// so Explore and Ride details can be tried before the backend has /api/rides.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
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

export const apiGet = (path) => request("GET", path);
export const apiPost = (path, body) => request("POST", path, body);
export const apiPut = (path, body) => request("PUT", path, body);
export const apiPatch = (path, body) => request("PATCH", path, body);

// ---------- Me ----------

// PATCH /api/me { name?, phone? } → { user }. Returns the updated user.
export const updateMe = (changes) => apiPatch("/api/me", changes).then((data) => data.user);

// GET /api/me/vehicle → { vehicle: {...} | null }. Returns the vehicle or null.
export const getMyVehicle = () => apiGet("/api/me/vehicle").then((data) => data.vehicle);

// PUT /api/me/vehicle { make, model, colour, plate, seats } → { vehicle }. Creates or replaces it.
export const saveMyVehicle = (vehicle) => apiPut("/api/me/vehicle", vehicle).then((data) => data.vehicle);

// GET /api/me/trips → { driving: [...], riding: [...] }
export const getMyTrips = () => apiGet("/api/me/trips");

// ---------- Rides ----------

// GET /api/rides?destination=&departs_after=&departs_before= → { rides: [...] }
// departsAfter / departsBefore are ISO times (Explore passes the start and end of the picked day).
export function searchRides({ destination = "", departsAfter, departsBefore } = {}) {
  if (USE_MOCKS) return mockSearchRides({ destination, departsAfter, departsBefore });
  const params = new URLSearchParams();
  if (destination) params.set("destination", destination);
  if (departsAfter) params.set("departs_after", departsAfter);
  if (departsBefore) params.set("departs_before", departsBefore);
  const query = params.toString();
  return apiGet(`/api/rides${query ? `?${query}` : ""}`).then((data) => data.rides);
}

// POST /api/rides → 201 { ride }
export const postRide = (ride) => apiPost("/api/rides", ride).then((data) => data.ride);

// GET /api/rides/<id> → { ride }
export const getRide = (id) =>
  USE_MOCKS ? mockGetRide(id) : apiGet(`/api/rides/${id}`).then((data) => data.ride);

// PATCH /api/rides/<id>/cancel → { ride } (driver)
export const cancelRide = (id) => apiPatch(`/api/rides/${id}/cancel`).then((data) => data.ride);

// ---------- Ride requests ----------

// POST /api/rides/<id>/requests → 201 { request } (rider asks for one seat)
// Errors: RIDE_FULL, RIDE_CANCELLED, ALREADY_REQUESTED, OWN_RIDE
export const requestSeat = (rideId) =>
  USE_MOCKS ? mockRequestSeat(rideId) : apiPost(`/api/rides/${rideId}/requests`).then((data) => data.request);

// GET /api/rides/<id>/requests → { requests: [...] } (driver of that ride only)
export const getRideRequests = (rideId) => apiGet(`/api/rides/${rideId}/requests`).then((data) => data.requests);

// Status changes. Each one → { request }, or 409 INVALID_STATUS from the wrong status.
const requestAction = (action) => (requestId) =>
  apiPatch(`/api/requests/${requestId}/${action}`).then((data) => data.request);

export const acceptRequest = requestAction("accept"); // driver: pending → accepted (409 NO_SEATS_LEFT)
export const declineRequest = requestAction("decline"); // driver: pending → declined
export const removeRider = requestAction("remove"); // driver: accepted → removed
export const cancelRequest = requestAction("cancel"); // rider: pending or accepted → cancelled
export const completeRequest = requestAction("complete"); // rider: accepted, after departure → completed
