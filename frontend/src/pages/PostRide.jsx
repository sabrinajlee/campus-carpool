import { useId, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { Button, PageHeader, TextInput } from "../components";

// Step 1 of "Post a ride". Sends the trip to step 2 (PickupDropoff.jsx) as
// navigate("/post/pickup", { state: { origin, destination, depart_at, arrive_at, max_seats, pricing_type, price } })

const MIN_SEATS = 1;
const MAX_SEATS = 7;

const styles = {
  form: { marginTop: "var(--space-4)" },
  half: { maxWidth: "50%" },
  // Matches the shared .field__input so these rows line up with the text fields.
  box: {
    display: "flex",
    alignItems: "center",
    height: 44,
    padding: "0 var(--space-3)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
  },
  focused: { outline: "2px solid var(--color-primary)", outlineOffset: -1 },
  stepperLabel: { fontWeight: 600 },
  stepperControls: { display: "flex", alignItems: "center", gap: "var(--space-3)", marginLeft: "auto" },
  stepperBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    padding: 0,
    border: "none",
    borderRadius: "50%",
    background: "var(--color-primary-soft)",
    color: "var(--color-primary)",
    cursor: "pointer",
  },
  stepperBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  stepperValue: { minWidth: 20, textAlign: "center", fontSize: 16, fontWeight: 700 },
  priceBox: { gap: "var(--space-1)" },
  priceInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    border: "none",
    background: "transparent",
    font: "inherit",
    color: "var(--color-text)",
    outline: "none",
  },
  submit: { marginTop: "var(--space-2)" },
};

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// Fills the form back in when the driver comes back from step 2.
function initialForm(draft) {
  const [date = "", departTime = ""] = draft?.depart_at?.split("T") ?? [];
  return {
    origin: draft?.origin ?? "",
    destination: draft?.destination ?? "",
    date,
    departTime: departTime.slice(0, 5),
    arriveTime: draft?.arrive_at?.split("T")[1]?.slice(0, 5) ?? "",
    seats: draft?.max_seats ?? 3,
    price: draft?.price !== undefined ? String(draft.price) : "",
  };
}

function validate(form) {
  const errors = {};
  if (!form.origin.trim()) errors.origin = "Add where you're leaving from.";
  if (!form.destination.trim()) errors.destination = "Add where you're going.";
  if (
    form.origin.trim() &&
    form.origin.trim().toLowerCase() === form.destination.trim().toLowerCase()
  ) {
    errors.destination = "Destination must be different from where you're leaving.";
  }

  if (!form.date) errors.date = "Pick a date.";
  if (!form.departTime) errors.departTime = "Add a departure time.";
  if (form.date && form.departTime && new Date(`${form.date}T${form.departTime}`) <= new Date()) {
    errors.departTime = "Departure must be in the future.";
  }
  if (form.arriveTime && form.departTime && form.arriveTime <= form.departTime) {
    errors.arriveTime = "Arrival must be after departure.";
  }

  const price = Number(form.price);
  if (form.price === "") errors.price = "Add a price per seat.";
  else if (Number.isNaN(price) || price <= 0) errors.price = "Price must be more than $0.";
  else if (!/^\d+(\.\d{1,2})?$/.test(form.price)) errors.price = "Use at most 2 decimal places.";

  return errors;
}

export default function PostRide() {
  const navigate = useNavigate();
  const location = useLocation();
  const priceId = useId();

  const [form, setForm] = useState(() => initialForm(location.state));
  const [errors, setErrors] = useState({});
  const [priceFocused, setPriceFocused] = useState(false);

  function update(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function changeSeats(delta) {
    setForm((prev) => ({
      ...prev,
      seats: Math.min(MAX_SEATS, Math.max(MIN_SEATS, prev.seats + delta)),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const trip = {
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      depart_at: `${form.date}T${form.departTime}:00`,
      arrive_at: form.arriveTime ? `${form.date}T${form.arriveTime}:00` : null,
      max_seats: form.seats,
      pricing_type: "per_seat",
      price: Number(form.price),
    };

    // Save the draft on this history entry so "back" from step 2 keeps the form filled in.
    navigate(location.pathname, { replace: true, state: trip });
    navigate("/post/pickup", { state: trip });
  }

  return (
    <main className="page">
      <PageHeader title="Post a ride" subtitle="Share a trip you're already planning." />

      <form style={styles.form} onSubmit={handleSubmit} noValidate>
        <TextInput
          label="Leaving from"
          placeholder="London, ON"
          value={form.origin}
          onChange={update("origin")}
          error={errors.origin}
          autoComplete="off"
        />
        <TextInput
          label="Going to"
          placeholder="Toronto, ON"
          value={form.destination}
          onChange={update("destination")}
          error={errors.destination}
          autoComplete="off"
        />
        <TextInput
          label="Date"
          type="date"
          min={todayString()}
          value={form.date}
          onChange={update("date")}
          error={errors.date}
        />
        <div style={styles.half}>
          <TextInput
            label="Departure time"
            type="time"
            value={form.departTime}
            onChange={update("departTime")}
            error={errors.departTime}
          />
        </div>
        <div style={styles.half}>
          <TextInput
            label="Estimated arrival time"
            type="time"
            value={form.arriveTime}
            onChange={update("arriveTime")}
            error={errors.arriveTime}
          />
        </div>

        <div className="field">
          <span className="field__label">Available seats</span>
          <div style={styles.box}>
            <span style={styles.stepperLabel}>Passengers</span>
            <div style={styles.stepperControls}>
              <button
                type="button"
                style={{ ...styles.stepperBtn, ...(form.seats <= MIN_SEATS && styles.stepperBtnDisabled) }}
                onClick={() => changeSeats(-1)}
                disabled={form.seats <= MIN_SEATS}
                aria-label="Remove a seat"
              >
                <Minus size={16} strokeWidth={2.5} />
              </button>
              <span style={styles.stepperValue} aria-live="polite">
                {form.seats}
              </span>
              <button
                type="button"
                style={{ ...styles.stepperBtn, ...(form.seats >= MAX_SEATS && styles.stepperBtnDisabled) }}
                onClick={() => changeSeats(1)}
                disabled={form.seats >= MAX_SEATS}
                aria-label="Add a seat"
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor={priceId}>
            Price per seat
          </label>
          <div style={{ ...styles.box, ...styles.priceBox, ...(priceFocused && styles.focused) }}>
            <span>$</span>
            <input
              id={priceId}
              style={styles.priceInput}
              type="text"
              inputMode="decimal"
              placeholder="XX"
              value={form.price}
              onChange={update("price")}
              onFocus={() => setPriceFocused(true)}
              onBlur={() => setPriceFocused(false)}
            />
            <span>CAD</span>
          </div>
          {errors.price && <span className="field__error">{errors.price}</span>}
        </div>

        <Button type="submit" fullWidth style={styles.submit}>
          Continue to pickup details
        </Button>
      </form>
    </main>
  );
}
