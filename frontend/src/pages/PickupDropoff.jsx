import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, PageHeader, TextInput } from "../components";
import "./PickupDropoff.css";

// Step 2 of "Post a ride". Step 1 (PostRide.jsx) sends its data with
// navigate("/post/pickup", { state: { origin, destination, depart_at, max_seats, pricing_type, price } })

const API_URL = import.meta.env.VITE_API_URL;

function formatDepart(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
  const time = date.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
  return `${day} • ${time.toUpperCase()}`;
}

function formatPrice(trip) {
  if (trip.price === undefined || trip.price === "") return "$XX/seat";
  const value = Number(trip.price);
  const amount = value.toFixed(value % 1 === 0 ? 0 : 2);
  return trip.pricing_type === "total" ? `$${amount} total` : `$${amount}/seat`;
}

export default function PickupDropoff() {
  const navigate = useNavigate();
  const trip = useLocation().state ?? {
  origin: "London",
  destination: "Toronto",
  depart_at: "2026-11-13T16:30:00",
  max_seats: 3,
  pricing_type: "per_seat",
  price: 25,
};

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      const res = await fetch(`${API_URL}/rides`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...trip,
          pickup_point: pickup.trim(),
          dropoff_point: dropoff.trim(),
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Couldn't post your ride. Try again.");
      }
      navigate("/trips");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
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

        <Button type="submit" fullWidth disabled={submitting} className="pickup-submit">
          {submitting ? "Posting…" : "Post ride"}
        </Button>
      </form>
    </main>
  );
}
