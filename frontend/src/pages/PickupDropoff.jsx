import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, PageHeader, TextInput } from "../components";

// Step 2 of "Post a ride". Step 1 (PostRide.jsx) sends its data with
// navigate("/post/pickup", { state: { origin, destination, depart_at, max_seats, pricing_type, price } })

const API_URL = import.meta.env.VITE_API_URL;

const styles = {
  details: { marginTop: "var(--space-5)" },
  summary: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
    marginTop: "var(--space-5)",
    padding: "var(--space-5)",
  },
  summaryTitle: { color: "var(--color-primary)" },
  route: { margin: 0, fontSize: 16, fontWeight: 700 },
  bottom: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "var(--space-3)",
  },
  meta: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-1)",
    color: "var(--color-text-muted)",
  },
  price: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--color-primary)",
    whiteSpace: "nowrap",
  },
  error: {
    margin: "var(--space-4) 0 0",
    padding: "var(--space-3)",
    borderRadius: "var(--radius-sm)",
    background: "var(--color-danger-bg)",
    color: "var(--color-danger-text)",
    fontSize: 12,
  },
  submit: { marginTop: "var(--space-6)" },
  missing: { display: "flex", flexDirection: "column", gap: "var(--space-3)" },
  missingText: { margin: 0, color: "var(--color-text-muted)" },
};

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
        <Card style={styles.missing}>
          <p style={styles.missingText}>Start with your trip details first.</p>
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
        <div style={styles.details}>
          <TextInput
            label="Other trip details"
            placeholder="luggage space, flexibility, stops..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
          />
        </div>

        <Card soft style={styles.summary}>
          <h2 style={styles.summaryTitle}>Trip summary</h2>
          <p style={styles.route}>
            {trip.origin} → {trip.destination}
          </p>
          <div style={styles.bottom}>
            <div style={styles.meta}>
              <span>{formatDepart(trip.depart_at)}</span>
              <span>
                {seats} {seats === 1 ? "seat" : "seats"} available
              </span>
            </div>
            <span style={styles.price}>{formatPrice(trip)}</span>
          </div>
        </Card>

        {submitError && (
          <p style={styles.error} role="alert">
            {submitError}
          </p>
        )}

        <Button type="submit" fullWidth disabled={submitting} style={styles.submit}>
          {submitting ? "Posting…" : "Post ride"}
        </Button>
      </form>
    </main>
  );
}
