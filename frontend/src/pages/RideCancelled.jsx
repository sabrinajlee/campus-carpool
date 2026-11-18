import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getRide } from "../api";
import { Button, ConfirmationLayout, TripSummaryCard } from "../components";
import "./RideCancelled.css";

// Ride cancelled: terminal confirmation after a rider cancels their request (from /rides/:id)
// or a driver cancels their ride (from /trips/:id/requests).
//
// The page that cancels navigates here with replace and passes who cancelled and the ride:
//
//   navigate(`/rides/${ride.id}/cancelled`, {
//     replace: true,
//     state: { cancelledBy: "rider" | "driver",
//              ride: { origin, destination, depart_at } },
//   });
//
// If the ride isn't in state (page refreshed or opened directly), it's loaded from
// GET /api/rides/:id, which returns (fields from the rides table; getRide unwraps "ride"):
//
// { "ride": { "id": 4, "origin": "London", "destination": "Toronto",
//             "depart_at": "2026-11-13T21:30:00Z", "status": "cancelled", ... } }
//
// cancelledBy defaults to "rider" when missing.

// ---------- Sample data for testing ----------
// While USE_SAMPLE_DATA is true, a ride missing from state comes from SAMPLE_RIDE
// instead of the backend. Set it to false once GET /api/rides/:id exists.
// Try the driver copy by opening this page with state { cancelledBy: "driver" }.
const USE_SAMPLE_DATA = true;

const SAMPLE_RIDE = {
  id: 4,
  origin: "London",
  destination: "Toronto",
  depart_at: "2026-11-13T21:30:00Z", // Friday, November 13 · 4:30 PM in Toronto
  status: "cancelled",
};

const SUBTITLES = {
  rider: "Driver will be notified.",
  driver: "Riders will be notified.",
};

export default function RideCancelled() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const cancelledBy = state?.cancelledBy === "driver" ? "driver" : "rider";
  const [ride, setRide] = useState(state?.ride ?? null);
  const [error, setError] = useState("");

  const fetchRide = useCallback(async () => (USE_SAMPLE_DATA ? SAMPLE_RIDE : await getRide(id)), [id]);
  const showError = () => setError("Couldn't load the trip details.");

  useEffect(() => {
    if (!state?.ride) fetchRide().then(setRide).catch(showError);
  }, [state, fetchRide]);

  const retry = () => {
    setError("");
    fetchRide().then(setRide).catch(showError);
  };

  return (
    <div className="app-shell">
      <ConfirmationLayout
        icon="cancel"
        title="Ride Cancelled!"
        subtitle={SUBTITLES[cancelledBy]}
        actions={
          <>
            <Button fullWidth onClick={() => navigate(cancelledBy === "driver" ? "/trips?tab=driving" : "/trips")}>
              My trips
            </Button>
            <Button variant="secondary" fullWidth onClick={() => navigate("/")}>
              Back to explore
            </Button>
          </>
        }
      >
        {ride ? (
          <TripSummaryCard origin={ride.origin} destination={ride.destination} departAt={ride.depart_at} />
        ) : error ? (
          <div className="ride-cancelled-status">
            <p role="alert">{error}</p>
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          </div>
        ) : (
          <p className="ride-cancelled-status">Loading trip…</p>
        )}
      </ConfirmationLayout>
    </div>
  );
}
