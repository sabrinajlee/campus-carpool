import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postRide } from "../api";
import { Button, Card, PageHeader, TextInput } from "../components";
import "./PickupDropoff.css";

// Step 2 of "Post a ride". Step 1 (PostRide.jsx) sends its data with
// navigate("/post/pickup", { state: { origin, destination, depart_at, arrive_at, max_seats, price_per_seat } })
// Post ride calls POST /api/rides, then replaces history with /rides/:id/posted so Back can't post twice.

// Step 1's local "2026-11-13T16:30:00" → UTC ISO string for the API. null stays null.
function toIso(localDateTime) {
  return localDateTime ? new Date(localDateTime).toISOString() : null;
}

function formatDepart(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
  const time = date.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
  return `${day} • ${time.toUpperCase()}`;
}

function formatPrice(trip) {
  if (trip.price_per_seat === undefined || trip.price_per_seat === "") return "$XX/seat";
  const value = Number(trip.price_per_seat);
  return `$${value.toFixed(value % 1 === 0 ? 0 : 2)}/seat`;
}

export default function PickupDropoff() {
  const navigate = useNavigate();
  const trip = useLocation().state;

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsVehicle, setNeedsVehicle] = useState(false);

  // Opened /post/pickup directly, so there's no step 1 data.
  if (!trip) {
    return (
      <main className="page">
        <PageHeader title="Pickup & drop-off" subtitle="Last step before your trip gets posted." showBack />
        <Card className="pickup-missing">
          <p className="pickup-missing-text">Start with your trip details first.</p>
          <Button fullWidth onClick={() => navigate("/post")}>
            Go to Post a ride
          </Button>
        </Card>
      </main>
    );
  }

  function validate() {
    const next = {};
    if (!pickup.trim()) next.pickup = "Add a pickup location.";
    if (!dropoff.trim()) next.dropoff = "Add a drop-off location.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const ride = await postRide({
        origin: trip.origin,
        destination: trip.destination,
        depart_at: toIso(trip.depart_at),
        arrive_at: toIso(trip.arrive_at),
        max_seats: trip.max_seats,
        price_per_seat: trip.price_per_seat,
        pickup_point: pickup.trim(),
        dropoff_point: dropoff.trim(),
        notes: notes.trim() || null,
      });
      navigate(`/rides/${ride.id}/posted`, { replace: true, state: { ride } });
    } catch (err) {
      setSubmitError(err.message || "Couldn't post your ride. Try again.");
      setNeedsVehicle(err.code === "NO_VEHICLE");
      setSubmitting(false);
    }
  }

  const seats = Number(trip.max_seats);

  return (
    <main className="page">
      <PageHeader title="Pickup & drop-off" subtitle="Last step before your trip gets posted." showBack />

      <form onSubmit={handleSubmit} noValidate>
        <TextInput
          label="Pickup location"
          placeholder="e.g. Western University main gates"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          error={errors.pickup}
          maxLength={200}
        />
        <TextInput
          label="Drop-off location"
          placeholder="e.g. Union Station area, Toronto"
          value={dropoff}
          onChange={(e) => setDropoff(e.target.value)}
          error={errors.dropoff}
          maxLength={200}
        />
        <div className="pickup-details">
          <TextInput
            label="Other trip details"
            placeholder="luggage space, flexibility, stops..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            maxLength={500}
          />
        </div>

        <Card soft className="pickup-summary">
          <h2 className="pickup-summary-title">Trip summary</h2>
          <p className="pickup-route">
            {trip.origin} → {trip.destination}
          </p>
          <div className="pickup-bottom">
            <div className="pickup-meta">
              <span>{formatDepart(trip.depart_at)}</span>
              <span>
                {seats} {seats === 1 ? "seat" : "seats"} available
              </span>
            </div>
            <span className="pickup-price">{formatPrice(trip)}</span>
          </div>
        </Card>

        {submitError && (
          <p className="pickup-error" role="alert">
            {submitError}
          </p>
        )}

        {/* Until Post a ride has its "add a vehicle first" dialog, the server's NO_VEHICLE lands here */}
        {needsVehicle && (
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => navigate("/profile/vehicle?next=/post")}
          >
            Add your vehicle
          </Button>
        )}

        <Button type="submit" fullWidth disabled={submitting} className="pickup-submit">
          {submitting ? "Posting…" : "Post ride"}
        </Button>
      </form>
    </main>
  );
}
