import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getRide } from "../api";
import { Button, Card, ConfirmationLayout, StatusBadge, TripSummaryCard } from "../components";
import "./RequestSent.css";

// Request sent: terminal confirmation after "Request a seat" on Ride details.
// Ride details should get here with
//   navigate(`/rides/${ride.id}/requested`, { replace: true, state: { ride } })
// passing the ride it already has, so Back can't resubmit the request. Without that
// state (a refresh or a direct link), the page loads the ride from GET /api/rides/:id,
// which returns:
//
// { "id": 4, "origin": "London", "destination": "Toronto",
//   "depart_at": "2026-11-13T21:30:00Z", "pickup_point": "Masonville Mall",
//   "dropoff_point": "Union Station", "max_seats": 3, "seats_left": 2,
//   "price_per_seat": 25, "notes": null, "status": "open",
//   "driver": { "id": 2, "name": "Alex Chen" } }
//
// Only origin, destination, depart_at and the driver's name are shown here.

// ---------- Sample data for testing ----------
// While USE_SAMPLE_DATA is true, a ride missing from state comes from SAMPLE_RIDE
// instead of the backend. Set it to false once GET /api/rides/:id exists.
const USE_SAMPLE_DATA = true;

const SAMPLE_RIDE = {
  id: 4,
  origin: "London",
  destination: "Toronto",
  depart_at: "2026-11-13T21:30:00Z", // Friday, November 13 · 4:30 PM in Toronto
  pickup_point: "Masonville Mall",
  dropoff_point: "Union Station",
  max_seats: 3,
  seats_left: 2,
  price_per_seat: 25,
  notes: null,
  status: "open",
  driver: { id: 2, name: "Alex Chen" },
};

// "Alex will review your request to join the ride to Toronto."
function subtitleFor(ride) {
  if (!ride) return "The driver will review your request.";
  const driver = ride.driver?.name?.split(" ")[0] || "The driver";
  return `${driver} will review your request to join the ride to ${ride.destination}.`;
}

export default function RequestSent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const passedRide = useLocation().state?.ride;

  const [ride, setRide] = useState(passedRide ?? null);
  const [error, setError] = useState("");

  const load = useCallback(
    () =>
      (USE_SAMPLE_DATA ? Promise.resolve(SAMPLE_RIDE) : getRide(id))
        .then(setRide)
        .catch(() => setError("Couldn't load the trip details. Check your connection and try again.")),
    [id]
  );

  useEffect(() => {
    if (!passedRide) load();
  }, [passedRide, load]);

  const retry = () => {
    setError("");
    load();
  };

  return (
    <div className="app-shell">
      <ConfirmationLayout
        icon="check"
        title="Request sent!"
        subtitle={subtitleFor(ride)}
        actions={
          <>
            <Button fullWidth onClick={() => navigate("/trips")}>
              My trips
            </Button>
            <Button variant="secondary" fullWidth onClick={() => navigate("/")}>
              Back to explore
            </Button>
          </>
        }
      >
        {error ? (
          <Card className="request-sent-error">
            <p className="request-sent-error-text" role="alert">
              {error}
            </p>
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          </Card>
        ) : !ride ? (
          <p className="request-sent-status">Loading trip…</p>
        ) : (
          <TripSummaryCard
            origin={ride.origin}
            destination={ride.destination}
            departAt={ride.depart_at}
            badge={<StatusBadge status="pending" label="Request pending" />}
            note="You'll see updates under My trips."
          />
        )}
      </ConfirmationLayout>
    </div>
  );
}
