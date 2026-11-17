import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getMyTrips } from "../api";
import { Button, Card, PageHeader, StatusBadge } from "../components";

// My trips: rides I asked to join (Riding) and rides I posted (Driving).
// Data comes from GET /api/me/trips, which returns:
//
// {
//   "driving": [{ "id": 4, "origin": "London", "destination": "Toronto",
//                 "depart_at": "2026-11-13T16:30:00", "status": "open",
//                 "max_seats": 3, "pending_requests": 1,
//                 "passengers": ["Allen", "Bobby"] }],
//   "riding":  [{ "id": 7, "request_id": 12, "request_status": "pending",
//                 "origin": "London", "destination": "Ottawa",
//                 "depart_at": "2026-11-20T08:00:00", "status": "open",
//                 "driver_name": "Jane Doe" }]
// }
//
// driving[].status / riding[].status: rides.status (open, full, cancelled, completed)
// riding[].request_status: ride_requests.status (pending, accepted, declined, cancelled)
// driving[].passengers: names of riders whose request was accepted

// ---------- Sample data for testing ----------
// While USE_SAMPLE_DATA is true, the page shows the trips below instead of
// calling the backend. Set it to false once GET /api/me/trips exists.
const USE_SAMPLE_DATA = true;

// Dates are relative to today so "Upcoming" and "Past" always have trips.
function daysFromNow(days, hour, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const SAMPLE_TRIPS = {
  driving: [
    {
      id: 1, origin: "London", destination: "Toronto", depart_at: daysFromNow(3, 16, 30),
      status: "open", max_seats: 3, pending_requests: 1, passengers: [],
    },
    {
      id: 2, origin: "London", destination: "Kitchener", depart_at: daysFromNow(4, 9),
      status: "full", max_seats: 3, pending_requests: 0, passengers: ["Allen", "Bobby", "Carmen"],
    },
    {
      id: 3, origin: "London", destination: "Ottawa", depart_at: daysFromNow(10, 7),
      status: "open", max_seats: 4, pending_requests: 0, passengers: ["Dana"],
    },
    {
      id: 4, origin: "London", destination: "Windsor", depart_at: daysFromNow(-11, 18),
      status: "completed", max_seats: 2, pending_requests: 0, passengers: ["Eli", "Fay"],
    },
  ],
  riding: [
    {
      id: 8, request_id: 20, request_status: "accepted", origin: "London", destination: "Hamilton",
      depart_at: daysFromNow(2, 15, 15), status: "open", driver_name: "Ellie Kim",
    },
    {
      id: 9, request_id: 21, request_status: "pending", origin: "London", destination: "Toronto",
      depart_at: daysFromNow(5, 10), status: "open", driver_name: "Sabrina Lee",
    },
    {
      id: 7, request_id: 19, request_status: "declined", origin: "London", destination: "Niagara Falls",
      depart_at: daysFromNow(11, 9), status: "open", driver_name: "Lauren",
    },
    {
      id: 6, request_id: 15, request_status: "accepted", origin: "London", destination: "Waterloo",
      depart_at: daysFromNow(-6, 17), status: "completed", driver_name: "Eman",
    },
  ],
};

const styles = {
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "var(--space-1)",
    padding: "var(--space-1)",
    marginBottom: "var(--space-5)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
  },
  tab: {
    minHeight: 44,
    border: "none",
    borderRadius: "var(--radius-sm)",
    background: "transparent",
    font: "inherit",
    fontSize: 15,
    fontWeight: 600,
    color: "var(--color-text-muted)",
    cursor: "pointer",
  },
  tabActive: { background: "var(--color-primary-soft)", color: "var(--color-primary)" },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-4)",
    marginBottom: "var(--space-6)",
  },
  sectionTitle: { fontSize: 20, fontWeight: 700 },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
    padding: "var(--space-5) var(--space-5) var(--space-4)",
    borderRadius: 16,
  },
  top: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "var(--space-3)",
  },
  route: { margin: 0, fontSize: 18, fontWeight: 700 },
  badge: { flexShrink: 0, display: "flex" },
  neutralBadge: { background: "var(--color-neutral-bg)", color: "var(--color-neutral-text)" },
  meta: { margin: 0, color: "var(--color-text-muted)" },
  link: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "var(--space-2)",
    paddingTop: "var(--space-4)",
    borderTop: "1px solid var(--color-border)",
    color: "var(--color-primary)",
    fontWeight: 600,
    textDecoration: "none",
  },
  status: { color: "var(--color-text-muted)" },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "var(--space-3)",
  },
  emptyText: { margin: 0, color: "var(--color-text-muted)" },
};

// Inline styles can't reach the shared StatusBadge, so this one rule makes
// every badge on this page the larger Figma size.
const BADGE_SIZE = `.trips-badge .badge { padding: 6px 16px; font-size: 13px; white-space: nowrap; }`;

const TABS = [
  { id: "riding", label: "Riding" },
  { id: "driving", label: "Driving" },
];

function formatDepart(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
  const time = date.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time.toUpperCase().replace(/\./g, "")}`;
}

// A trip is "past" once it has left, or once it can no longer happen for me.
function isPast(trip, tab) {
  if (new Date(trip.depart_at) < new Date()) return true;
  if (trip.status === "cancelled" || trip.status === "completed") return true;
  return tab === "riding" && trip.request_status === "cancelled";
}

function DrivingBadge({ trip }) {
  if (trip.status === "cancelled") return <span className="badge" style={styles.neutralBadge}>Cancelled</span>;
  if (trip.status === "completed") return <span className="badge" style={styles.neutralBadge}>Completed</span>;
  if (trip.pending_requests > 0) {
    return (
      <span className="badge badge--pending">
        {trip.pending_requests} {trip.pending_requests === 1 ? "Request" : "Requests"}
      </span>
    );
  }
  const taken = trip.passengers?.length ?? 0;
  if (trip.status === "full" || taken >= trip.max_seats) {
    return <span className="badge badge--accepted">Seats Filled</span>;
  }
  const left = trip.max_seats - taken;
  return <span className="badge" style={styles.neutralBadge}>{left} {left === 1 ? "seat" : "seats"} left</span>;
}

function TripCard({ trip, tab }) {
  // Drivers go to their request list; riders go to the ride itself.
  const to = tab === "driving" ? `/trips/${trip.id}/requests` : `/rides/${trip.id}`;
  const people =
    tab === "driving"
      ? `Passengers: ${trip.passengers?.length ? trip.passengers.join(", ") : "None"}`
      : `Driver: ${trip.driver_name ?? "Unknown"}`;

  return (
    <Card style={styles.card}>
      <div style={styles.top}>
        <h3 style={styles.route}>
          {trip.origin} → {trip.destination}
        </h3>
        <div className="trips-badge" style={styles.badge}>
          {tab === "driving" ? <DrivingBadge trip={trip} /> : <StatusBadge status={trip.request_status} />}
        </div>
      </div>
      <p style={styles.meta}>{formatDepart(trip.depart_at)}</p>
      <p style={styles.meta}>{people}</p>
      <Link style={styles.link} to={to}>
        View trip details
        <ChevronRight size={18} aria-hidden="true" />
      </Link>
    </Card>
  );
}

function EmptyState({ tab }) {
  const navigate = useNavigate();
  return tab === "driving" ? (
    <Card style={styles.empty}>
      <p style={styles.emptyText}>You haven't posted any rides yet.</p>
      <Button onClick={() => navigate("/post")}>Post a ride</Button>
    </Card>
  ) : (
    <Card style={styles.empty}>
      <p style={styles.emptyText}>You haven't asked to join any rides yet.</p>
      <Button onClick={() => navigate("/")}>Find a ride</Button>
    </Card>
  );
}

export default function MyTrips() {
  // Keep the tab in the URL (/trips?tab=driving) so "back" returns to the same tab.
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "driving" ? "driving" : "riding";

  const [trips, setTrips] = useState(null); // { driving: [], riding: [] }
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setTrips(USE_SAMPLE_DATA ? SAMPLE_TRIPS : await getMyTrips());
    } catch {
      setError("Couldn't load your trips. Check your connection and try again.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const list = [...(trips?.[tab] ?? [])].sort((a, b) => new Date(a.depart_at) - new Date(b.depart_at));
  const upcoming = list.filter((t) => !isPast(t, tab));
  const past = list.filter((t) => isPast(t, tab)).reverse(); // most recent first

  return (
    <main className="page">
      <style>{BADGE_SIZE}</style>
      <PageHeader title="My trips" subtitle="Keep track of rides you request or offer." />

      <div style={styles.tabs} role="tablist" aria-label="Trip type">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            style={{ ...styles.tab, ...(tab === t.id && styles.tabActive) }}
            onClick={() => setSearchParams(t.id === "riding" ? {} : { tab: t.id }, { replace: true })}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {error ? (
          <Card style={styles.empty}>
            <p style={styles.emptyText} role="alert">
              {error}
            </p>
            <Button variant="secondary" onClick={load}>
              Try again
            </Button>
          </Card>
        ) : !trips ? (
          <p style={styles.status}>Loading your trips…</p>
        ) : list.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <>
            {upcoming.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Upcoming</h2>
                {upcoming.map((trip) => (
                  <TripCard key={trip.request_id ?? trip.id} trip={trip} tab={tab} />
                ))}
              </section>
            )}
            {past.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Past</h2>
                {past.map((trip) => (
                  <TripCard key={trip.request_id ?? trip.id} trip={trip} tab={tab} />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
