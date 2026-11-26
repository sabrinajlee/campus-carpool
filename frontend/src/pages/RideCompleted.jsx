import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { completeRequest, getRide } from "../api";
import { Alert, Button, Card, ConfirmationLayout, TripSummaryCard } from "../components";
import "./RideCompleted.css";

// Was your ride completed? Opens instead of Ride details when a rider taps a past trip on My trips.
// Completed! records the completion and goes to My trips. My trips and Back to explore skip it,
// so the screen shows again next time.
//
// Data comes from GET /api/rides/<id>, which returns { "ride": {...} } (getRide unwraps "ride").
// This page uses these fields (full shape in docs/api-spec.md):
//
// { "id": 7, "origin": "London", "destination": "Toronto",
//   "depart_at": "2026-11-13T21:30:00Z", "status": "open",
//   "driver": { "id": 3, "name": "Johnny Appleseed" },
//   "my_request": { "id": 15, "status": "accepted" } }
//
// status: rides.status (open, full, cancelled, completed)
// my_request: the logged-in rider's ride_requests row (null if they never asked)
// my_request.status: pending, accepted, declined, cancelled, removed, completed
//
// Completed! calls PATCH /api/requests/<my_request.id>/complete (in docs/api-spec.md, not in the backend yet).

// ---------- Sample data for testing ----------
// While USE_SAMPLE_DATA is true, the page shows the ride below and Completed! doesn't call
// the backend. Set it to false once GET /rides/<id> and the complete endpoint exist.
const USE_SAMPLE_DATA = true;

// Five days ago at 4:30 PM, so the ride is always in the past.
function daysAgo(days, hour, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const SAMPLE_RIDE = {
  id: 7,
  origin: "London",
  destination: "Toronto",
  depart_at: daysAgo(5, 16, 30),
  status: "open",
  driver: { id: 3, name: "Johnny Appleseed" },
  my_request: { id: 15, status: "accepted" },
};

// Only accepted riders on a ride that has left get asked. Anyone else sees Ride details.
function canConfirm(ride) {
  return ride.my_request?.status === "accepted" && new Date(ride.depart_at) < new Date();
}

export default function RideCompleted() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    (USE_SAMPLE_DATA ? Promise.resolve(SAMPLE_RIDE) : getRide(id))
      .then((data) => {
        if (!active) return;
        if (canConfirm(data)) setRide(data);
        else navigate(`/rides/${id}`, { replace: true });
      })
      .catch(() => {
        if (active) setLoadError("Couldn't load this ride. Check your connection and try again.");
      });
    return () => {
      active = false;
    };
  }, [id, navigate, reloadKey]);

  function retry() {
    setLoadError("");
    setReloadKey((key) => key + 1);
  }

  async function handleCompleted() {
    setSaving(true);
    setSaveError("");
    try {
      if (!USE_SAMPLE_DATA) await completeRequest(ride.my_request.id);
      navigate("/trips", { replace: true });
    } catch (err) {
      setSaveError(err.message || "Couldn't save that. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <ConfirmationLayout
        icon="car"
        title="Was your ride completed?"
        subtitle="Let us know if everything went smoothly."
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
        {loadError ? (
          <Card className="ride-completed-error">
            <p className="ride-completed-muted" role="alert">
              {loadError}
            </p>
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          </Card>
        ) : !ride ? (
          <p className="ride-completed-muted ride-completed-loading">Loading your ride…</p>
        ) : (
          <div className="ride-completed-content">
            <TripSummaryCard
              origin={ride.origin}
              destination={ride.destination}
              departAt={ride.depart_at}
              note={`You rode with ${ride.driver?.name ?? "your driver"}.`}
            />
            <Button variant="success" fullWidth onClick={handleCompleted} disabled={saving} aria-busy={saving}>
              {saving ? "Saving…" : "Completed!"}
            </Button>
            {saveError && <Alert type="error">{saveError}</Alert>}
          </div>
        )}
      </ConfirmationLayout>
    </div>
  );
}
