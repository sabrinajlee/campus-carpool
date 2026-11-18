import { useId, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { Button, PageHeader, TextInput } from "../components";
import "./PostRide.css";

// Step 1 of "Post a ride". Sends the trip to step 2 (PickupDropoff.jsx) as
// navigate("/post/pickup", { state: { origin, destination, depart_at, arrive_at, max_seats, pricing_type, price } })

const MIN_SEATS = 1;
const MAX_SEATS = 7;

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

      <form className="post-ride-form" onSubmit={handleSubmit} noValidate>
        <TextInput
          label="Leaving from"
          placeholder="London, ON"
          value={form.origin}
          onChange={update("origin")}
          error={errors.origin}
          className="post-ride-input"
          autoComplete="off"
        />
        <TextInput
          label="Going to"
          placeholder="Toronto, ON"
          value={form.destination}
          onChange={update("destination")}
          error={errors.destination}
          className="post-ride-input"
          autoComplete="off"
        />
        <TextInput
          label="Date"
          type="date"
          min={todayString()}
          value={form.date}
          onChange={update("date")}
          error={errors.date}
          className="post-ride-input"
        />
        <div className="post-ride-half">
          <TextInput
            label="Departure time"
            type="time"
            value={form.departTime}
            onChange={update("departTime")}
            error={errors.departTime}
            className="post-ride-input"
          />
        </div>
        <div className="post-ride-half">
          <TextInput
            label="Estimated arrival time"
            type="time"
            value={form.arriveTime}
            onChange={update("arriveTime")}
            error={errors.arriveTime}
            className="post-ride-input"
          />
        </div>

        <div className="field">
          <span className="field__label">Available seats</span>
          <div className="post-ride-box">
            <span className="post-ride-stepper-label">Passengers</span>
            <div className="post-ride-stepper-controls">
              <button
                type="button"
                className="post-ride-stepper-btn"
                onClick={() => changeSeats(-1)}
                disabled={form.seats <= MIN_SEATS}
                aria-label="Remove a seat"
              >
                <Minus size={16} strokeWidth={2.5} />
              </button>
              <span className="post-ride-stepper-value" aria-live="polite">
                {form.seats}
              </span>
              <button
                type="button"
                className="post-ride-stepper-btn"
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
          <div className={`post-ride-box post-ride-price-box${priceFocused ? " post-ride-box--focused" : ""}`}>
            <span>$</span>
            <input
              id={priceId}
              className="post-ride-price-input"
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

        <Button type="submit" fullWidth className="post-ride-submit">
          Continue to pickup details
        </Button>
      </form>
    </main>
  );
}
