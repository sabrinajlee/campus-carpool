// Every backend call goes through this file (auth calls are in auth/authApi.js).
// Endpoints, request bodies and response shapes: docs/api-spec.md.
//
// URL conventions (see docs/api-spec.md):
//   /api/auth/*     session and account setup (built)
//   /api/me/*       the logged-in user's own data (profile, vehicle, trips)
//   /api/rides      rides, and the requests on a ride
//   /api/requests   one request; status changes are PATCH /<resource>/<id>/<action>
// Responses wrap the object in a named key ({ ride }, { rides }, { request }, ...).
// The functions below unwrap it, so pages get the object itself.

const API_URL = import.meta.env.VITE_API_URL;

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

// GET /api/rides?destination=&date= → { rides: [...] }
export const searchRides = ({ destination = "", date = "" } = {}) => {
  const params = new URLSearchParams();
  if (destination) params.set("destination", destination);
  if (date) params.set("date", date);
  const query = params.toString();
  return apiGet(`/api/rides${query ? `?${query}` : ""}`).then((data) => data.rides);
};

// POST /api/rides → 201 { ride }
export const postRide = (ride) => apiPost("/api/rides", ride).then((data) => data.ride);

// GET /api/rides/<id> → { ride }
export const getRide = (id) => apiGet(`/api/rides/${id}`).then((data) => data.ride);

// PATCH /api/rides/<id>/cancel → { ride } (driver)
export const cancelRide = (id) => apiPatch(`/api/rides/${id}/cancel`).then((data) => data.ride);

// ---------- Ride requests ----------

// POST /api/rides/<id>/requests → 201 { request } (rider asks for one seat)
export const requestSeat = (rideId) => apiPost(`/api/rides/${rideId}/requests`).then((data) => data.request);

// GET /api/rides/<id>/requests → { requests: [...] } (driver of that ride only)
export const getRideRequests = (rideId) => apiGet(`/api/rides/${rideId}/requests`).then((data) => data.requests);

// Status changes. Each one → { request }.
const requestAction = (action) => (requestId) =>
  apiPatch(`/api/requests/${requestId}/${action}`).then((data) => data.request);

export const acceptRequest = requestAction("accept"); // driver
export const declineRequest = requestAction("decline"); // driver
export const removeRider = requestAction("remove"); // driver, an accepted rider
export const cancelRequest = requestAction("cancel"); // rider
export const completeRequest = requestAction("complete"); // rider, after the trip
