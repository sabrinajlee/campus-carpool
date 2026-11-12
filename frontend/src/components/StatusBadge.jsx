// Matches ride_requests.status in the database.
const LABELS = {
  pending: "Waiting for driver",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
};

// <StatusBadge status="pending" />
export default function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{LABELS[status] ?? status}</span>;
}
