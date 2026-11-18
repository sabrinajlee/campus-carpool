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
