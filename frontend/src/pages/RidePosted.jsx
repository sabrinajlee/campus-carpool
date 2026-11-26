import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getRide } from "../api";
import { Button, Card, ConfirmationLayout, TripSummaryCard } from "../components";
import "./RidePosted.css";

// Ride posted: terminal confirmation after "Post ride" on Pickup & drop-off.
// Pickup & drop-off should get here with
//   navigate(`/rides/${ride.id}/posted`, { replace: true, state: { ride } })
// passing the ride returned by POST /api/rides. Without that state (a refresh or a
// direct link), the page loads the ride from GET /api/rides/:id, which returns
// { "ride": {...} } (getRide unwraps "ride"). The ride:
//
// { "id": 4, "origin": "London", "destination": "Toronto",
//   "depart_at": "2026-11-13T21:30:00Z", "pickup_point": "Masonville Mall",
//   "dropoff_point": "Union Station", "max_seats": 3, "seats_left": 3,
//   "price_per_seat": 25, "notes": null, "status": "open" }
//
// Only origin, destination and depart_at are shown here.

// ---------- Sample data for testing ----------
// While USE_SAMPLE_DATA is true, the page shows the ride below instead of
// calling the backend. Set it to false once GET /api/rides/:id exists.
const USE_SAMPLE_DATA = false;

function sampleRide(id) {
  // Three days from now at 4:30 PM, so it always reads as an upcoming ride.
  const departAt = new Date();
  departAt.setDate(departAt.getDate() + 3);
  departAt.setHours(16, 30, 0, 0);
  return {
    id: Number(id),
    origin: "London",
    destination: "Toronto",
    depart_at: departAt.toISOString(),
    pickup_point: "Masonville Mall",
    dropoff_point: "Union Station",
    max_seats: 3,
    seats_left: 3,
    price_per_seat: 25,
    notes: null,
    status: "open",
  };
}

export default function RidePosted() {
  const { id } = useParams();
  const navigate = useNavigate();
  const passedRide = useLocation().state?.ride;

  const [ride, setRide] = useState(passedRide ?? null);
  const [error, setError] = useState("");

  // State is only set in the promise callbacks, never synchronously in the effect.
  const fetchRide = useCallback(
    () =>
      (USE_SAMPLE_DATA ? Promise.resolve(sampleRide(id)) : getRide(id))
        .then(setRide)
        .catch(() => setError("Couldn't load your ride. Check your connection and try again.")),
    [id]
  );

  useEffect(() => {
    if (!passedRide) fetchRide();
  }, [passedRide, fetchRide]);

  function retry() {
    setError("");
    fetchRide();
  }

  const subtitle = ride
    ? `Riders can request to join the ride to ${ride.destination}.`
    : "Riders can request to join your ride.";

  return (
    <div className="app-shell">
      <ConfirmationLayout
        icon="check"
        title="Ride Posted!"
        subtitle={subtitle}
        actions={
          <>
            <Button fullWidth onClick={() => navigate("/trips?tab=driving")}>
              My trips
            </Button>
            <Button variant="secondary" fullWidth onClick={() => navigate("/")}>
              Back to explore
            </Button>
          </>
        }
      >
        {error ? (
          <Card className="ride-posted-error">
            <p className="ride-posted-error-text" role="alert">
              {error}
            </p>
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          </Card>
        ) : !ride ? (
          <p className="ride-posted-status">Loading your ride…</p>
        ) : (
          <TripSummaryCard
            origin={ride.origin}
            destination={ride.destination}
            departAt={ride.depart_at}
            note="You'll see updates under My trips."
          />
        )}
      </ConfirmationLayout>
    </div>
  );
}
