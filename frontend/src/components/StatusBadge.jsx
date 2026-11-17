// One place for every status label and colour.

// "2 seats left" / "1 seat left" ("Pending" if the count isn't known)
const seatsLeft = (count) =>
  count == null ? "Pending" : `${count} ${count === 1 ? "seat" : "seats"} left`;

// Request statuses match ride_requests.status in the database; the rest are display-only.
const STATUSES = {
  // Rider's request
  pending: { label: seatsLeft, tone: "warning" }, // amber = still waiting on the driver
  accepted: { label: "Accepted", tone: "success" },
  declined: { label: "Declined", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  completed: { label: "Completed", tone: "neutral" },
  // Driver's trip
  requests: { label: (count) => `${count} ${count === 1 ? "Request" : "Requests"}`, tone: "warning" },
  full: { label: "Seats Filled", tone: "success" },
  seats: { label: seatsLeft, tone: "neutral" },
};

// <StatusBadge status="pending" count={2} />               ("2 seats left", amber)
// <StatusBadge status="pending" label="Request pending" />  (same colour, different wording)
// <StatusBadge status="requests" count={2} />               ("2 Requests")
// <StatusBadge status="full" />                             ("Seats Filled")
// <StatusBadge status="seats" count={2} />                  ("2 seats left", grey: driver's open trip)
export default function StatusBadge({ status, count, label }) {
  const config = STATUSES[status];
  const text =
    label ?? (typeof config?.label === "function" ? config.label(count) : (config?.label ?? status));

  return <span className={`badge badge--${config?.tone ?? "neutral"}`}>{text}</span>;
}
