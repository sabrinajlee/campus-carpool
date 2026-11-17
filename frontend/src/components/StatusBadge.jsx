// One place for every status label and colour.
// Request statuses match ride_requests.status in the database; the rest are display-only.
const STATUSES = {
  // Rider's request
  pending: { label: "Waiting for driver", tone: "warning" },
  accepted: { label: "Accepted", tone: "success" },
  declined: { label: "Declined", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  completed: { label: "Completed", tone: "neutral" },
  // Driver's trip
  requests: { label: (count) => `${count} ${count === 1 ? "Request" : "Requests"}`, tone: "warning" },
  full: { label: "Seats Filled", tone: "success" },
  seats: { label: (count) => `${count} ${count === 1 ? "seat" : "seats"} left`, tone: "neutral" },
};

// <StatusBadge status="pending" />
// <StatusBadge status="pending" label="Request pending" />  (same colour, different wording)
// <StatusBadge status="requests" count={2} />               ("2 Requests")
// <StatusBadge status="full" />                             ("Seats Filled")
// <StatusBadge status="seats" count={2} />                  ("2 seats left")
export default function StatusBadge({ status, count = 0, label }) {
  const config = STATUSES[status];
  const text =
    label ?? (typeof config?.label === "function" ? config.label(count) : config?.label ?? status);

  return <span className={`badge badge--${config?.tone ?? "neutral"}`}>{text}</span>;
}
