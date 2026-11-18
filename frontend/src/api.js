const API_URL = import.meta.env.VITE_API_URL;

export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
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
export const getRide = (id) => apiGet(`/api/rides/${id}`).then((data) => data.ride);
export const completeRequest = (requestId) => apiPatch(`/api/requests/${requestId}/complete`);
