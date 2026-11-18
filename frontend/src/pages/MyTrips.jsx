import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getMyTrips } from "../api";
import { Button, Card, PageHeader, StatusBadge } from "../components";
import "./MyTrips.css";

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
//                 "driver_name": "Jane Doe", "seats_left": 2 }]
// }
//
// driving[].status / riding[].status: rides.status (open, full, cancelled, completed)
// riding[].id: the ride id; riding[].request_id: my ride_requests row
// riding[].request_status: ride_requests.status (pending, accepted, declined, cancelled, removed, completed)
// riding[].seats_left: seats still open on the ride (shown on pending requests)
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
      // Ids 5 and 10 match the driver's sample rides in RideDetails.jsx, so these cards open them.
      id: 5, origin: "London", destination: "Toronto", depart_at: daysFromNow(3, 16, 30),
      status: "open", max_seats: 3, pending_requests: 1, passengers: ["Alex", "Jordan"],
    },
    {
      id: 10, origin: "London", destination: "Kitchener", depart_at: daysFromNow(4, 9),
      status: "full", max_seats: 2, pending_requests: 0, passengers: ["Allen", "Bobby"],
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
      depart_at: daysFromNow(2, 15, 15), status: "open", driver_name: "Ellie Kim", seats_left: 1,
    },
    {
      id: 9, request_id: 21, request_status: "pending", origin: "London", destination: "Toronto",
      depart_at: daysFromNow(5, 10), status: "open", driver_name: "Sabrina Lee", seats_left: 2,
    },
    {
      id: 7, request_id: 19, request_status: "declined", origin: "London", destination: "Niagara Falls",
      depart_at: daysFromNow(11, 9), status: "open", driver_name: "Lauren", seats_left: 3,
    },
    {
      id: 6, request_id: 15, request_status: "accepted", origin: "London", destination: "Waterloo",
      depart_at: daysFromNow(-6, 17), status: "completed", driver_name: "Eman", seats_left: 0,
    },
  ],
};

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
  if (trip.status === "cancelled") return <StatusBadge status="cancelled" />;
  if (trip.status === "completed") return <StatusBadge status="completed" />;
  if (trip.pending_requests > 0) return <StatusBadge status="requests" count={trip.pending_requests} />;
  const taken = trip.passengers?.length ?? 0;
  if (trip.status === "full" || taken >= trip.max_seats) return <StatusBadge status="full" />;
  return <StatusBadge status="seats" count={trip.max_seats - taken} />;
}

// An accepted rider on a ride that has left (and wasn't cancelled) is asked if it was completed.
// Once they answer, request_status is "completed" and the card opens Ride details again.
function needsCompletion(trip) {
  return trip.request_status === "accepted" && trip.status !== "cancelled" && new Date(trip.depart_at) < new Date();
}

// Every card opens Ride details (drivers get the driver's view of their own ride there),
// except a past accepted riding trip, which asks "Was your ride completed?" first.
function tripLink(trip, tab) {
  return tab === "riding" && needsCompletion(trip) ? `/rides/${trip.id}/complete` : `/rides/${trip.id}`;
}

function TripCard({ trip, tab }) {
  const to = tripLink(trip, tab);
  const people =
    tab === "driving"
      ? `Passengers: ${trip.passengers?.length ? trip.passengers.join(", ") : "None"}`
      : `Driver: ${trip.driver_name ?? "Unknown"}`;

  return (
    <Card className="my-trips-card">
      <div className="my-trips-top">
        <h3 className="my-trips-route">
          {trip.origin} → {trip.destination}
        </h3>
        <div className="my-trips-badge">
          {tab === "driving" ? <DrivingBadge trip={trip} /> : <StatusBadge status={trip.request_status} count={trip.seats_left} />}
        </div>
      </div>
      <p className="my-trips-meta">{formatDepart(trip.depart_at)}</p>
      <p className="my-trips-meta">{people}</p>
      <Link className="my-trips-link" to={to}>
        View trip details
        <ChevronRight size={18} aria-hidden="true" />
      </Link>
    </Card>
  );
}

function EmptyState({ tab }) {
  const navigate = useNavigate();
  return tab === "driving" ? (
    <Card className="my-trips-empty">
      <p className="my-trips-empty-text">You haven't posted any rides yet.</p>
      <Button onClick={() => navigate("/post")}>Post a ride</Button>
    </Card>
  ) : (
    <Card className="my-trips-empty">
      <p className="my-trips-empty-text">You haven't asked to join any rides yet.</p>
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
      <PageHeader title="My trips" subtitle="Keep track of rides you request or offer." />

      <div className="my-trips-tabs" role="tablist" aria-label="Trip type">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`my-trips-tab${tab === t.id ? " my-trips-tab--active" : ""}`}
            onClick={() => setSearchParams(t.id === "riding" ? {} : { tab: t.id }, { replace: true })}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {error ? (
          <Card className="my-trips-empty">
            <p className="my-trips-empty-text" role="alert">
              {error}
            </p>
            <Button variant="secondary" onClick={load}>
              Try again
            </Button>
          </Card>
        ) : !trips ? (
          <p className="my-trips-status">Loading your trips…</p>
        ) : list.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="my-trips-section">
                <h2 className="my-trips-section-title">Upcoming</h2>
                {upcoming.map((trip) => (
                  <TripCard key={trip.request_id ?? trip.id} trip={trip} tab={tab} />
                ))}
              </section>
            )}
            {past.length > 0 && (
              <section className="my-trips-section">
                <h2 className="my-trips-section-title">Past</h2>
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
