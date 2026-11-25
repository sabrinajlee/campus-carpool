import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { getMyVehicle, saveMyVehicle } from "../api";
import { useAuth } from "../auth/AuthContext";
import { Alert, Button, Card, NumberStepper, PageHeader, TextInput, VehicleCard } from "../components";
import "./CarDetails.css";

// Car details (/profile/vehicle): the user's vehicle, shown only to riders they accept.
// One page opened from three places (see "Onboarding" in docs/frontend.md):
//   - onboarding (user.phone is null): no back arrow, "Skip for now" shown, Save and Skip go to /profile/basic-info
//   - the "add a vehicle first" dialog on /post: /profile/vehicle?next=/post, Save goes back to /post
//   - My profile: Save goes back to /profile
//
// Data: GET /api/me/vehicle and PUT /api/me/vehicle (in docs/api-spec.md, not in the backend yet).
// Response: { "vehicle": { "make": "Honda", "model": "Civic", "colour": "Silver",
//                          "plate": "CKRT 482", "seats": 3 } }  or  { "vehicle": null }
// getMyVehicle and saveMyVehicle unwrap "vehicle".
// seats: default seats for riders (1 to 7). Post a ride can change it per trip.

// ---------- Sample data for testing ----------
// While USE_SAMPLE_DATA is true, the page doesn't call the backend. Saving just moves on.
// Set SAMPLE_VEHICLE to an object (like the one above) to test editing a saved vehicle.
const USE_SAMPLE_DATA = true;
const SAMPLE_VEHICLE = null;

const MIN_SEATS = 1;
const MAX_SEATS = 7;
const DEFAULT_SEATS = 3;

const EMPTY_FORM = { make: "", model: "", colour: "", plate: "", seats: DEFAULT_SEATS };

const FIELD_ERRORS = {
  make: "Add the make.",
  model: "Add the model.",
  colour: "Add the colour.",
  plate: "Add the licence plate.",
};

function toForm(vehicle) {
  return vehicle ? { ...EMPTY_FORM, ...vehicle } : EMPTY_FORM;
}

function validate(form) {
  const errors = {};
  for (const field of Object.keys(FIELD_ERRORS)) {
    if (!String(form[field]).trim()) errors[field] = FIELD_ERRORS[field];
  }
  return errors;
}

function sameVehicle(a, b) {
  return ["make", "model", "colour", "plate", "seats"].every((key) => String(a[key]).trim() === String(b[key]).trim());
}

// Only follow ?next= inside the app (e.g. "/post"), never to another site.
function safeNext(value) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

function loadVehicle() {
  return USE_SAMPLE_DATA ? Promise.resolve(SAMPLE_VEHICLE) : getMyVehicle();
}

export default function CarDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Onboarding until the user has a phone number (set on the last onboarding step).
  const onboarding = !user?.phone;
  const nextPath = safeNext(searchParams.get("next")) ?? (onboarding ? "/profile/basic-info" : "/profile");

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [reloadKey, setReloadKey] = useState(0);
  const [saved, setSaved] = useState(null); // the vehicle as stored, or null if there isn't one
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let active = true;
    loadVehicle()
      .then((vehicle) => {
        if (!active) return;
        setSaved(vehicle);
        setForm(toForm(vehicle));
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  function retry() {
    setStatus("loading");
    setReloadKey((key) => key + 1);
  }

  const errors = validate(form);
  const changed = !saved || !sameVehicle(form, saved);
  const canSave = Object.keys(errors).length === 0 && changed && !submitting;

  function update(field) {
    return (e) => {
      const value = field === "plate" ? e.target.value.toUpperCase() : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  function touch(field) {
    return () => setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSave) return;

    const vehicle = {
      make: form.make.trim(),
      model: form.model.trim(),
      colour: form.colour.trim(),
      plate: form.plate.trim(),
      seats: form.seats,
    };

    setSaveError("");
    setSubmitting(true);
    try {
      if (!USE_SAMPLE_DATA) await saveMyVehicle(vehicle);
      navigate(nextPath);
    } catch (err) {
      setSaveError(err.message || "Couldn't save your vehicle. Try again.");
      setSubmitting(false);
    }
  }

  const header = (
    <PageHeader
      title="Add your vehicle"
      subtitle="So riders can find you at pickup. Only shared once you accept their request."
      showBack={!onboarding}
    />
  );

  if (status !== "ready") {
    return (
      <main className="page">
        {header}
        {status === "loading" ? (
          <p className="car-details-status">Loading your vehicle…</p>
        ) : (
          <Card className="car-details-error">
            <p className="car-details-error-text" role="alert">
              Couldn't load your vehicle. Check your connection and try again.
            </p>
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          </Card>
        )}
      </main>
    );
  }

  return (
    <main className="page car-details">
      {header}

      <form className="car-details-form" onSubmit={handleSubmit} noValidate>
        <div className="car-details-grid">
          <TextInput
            label="Make"
            placeholder="Honda"
            value={form.make}
            onChange={update("make")}
            onBlur={touch("make")}
            error={touched.make ? errors.make : undefined}
            maxLength={40}
          />
          <TextInput
            label="Model"
            placeholder="Civic"
            value={form.model}
            onChange={update("model")}
            onBlur={touch("model")}
            error={touched.model ? errors.model : undefined}
            maxLength={40}
          />
          <TextInput
            label="Colour"
            placeholder="Silver"
            value={form.colour}
            onChange={update("colour")}
            onBlur={touch("colour")}
            error={touched.colour ? errors.colour : undefined}
            maxLength={30}
          />
          <TextInput
            className="car-details-plate"
            label="Licence plate"
            placeholder="CKRT 482"
            value={form.plate}
            onChange={update("plate")}
            onBlur={touch("plate")}
            error={touched.plate ? errors.plate : undefined}
            maxLength={10}
            autoCapitalize="characters"
          />
        </div>

        <NumberStepper
          title="Seats for riders"
          subtitle="Your default. Change it on any trip."
          value={form.seats}
          onChange={(seats) => setForm((prev) => ({ ...prev, seats }))}
          min={MIN_SEATS}
          max={MAX_SEATS}
          decreaseLabel="Remove a seat"
          increaseLabel="Add a seat"
        />

        <section className="car-details-preview" aria-labelledby="car-details-preview-title">
          <p className="car-details-preview-title" id="car-details-preview-title">
            <Lock size={12} aria-hidden="true" />
            What accepted riders will see
          </p>
          <VehicleCard
            colour={form.colour.trim()}
            make={form.make.trim()}
            model={form.model.trim()}
            seats={form.seats}
            plate={form.plate.trim()}
          />
        </section>

        <div className="car-details-actions">
          {saveError && <Alert type="error">{saveError}</Alert>}
          <Button type="submit" fullWidth disabled={!canSave}>
            {submitting ? "Saving…" : "Save vehicle"}
          </Button>
          {onboarding && (
            <>
              <button type="button" className="car-details-skip" onClick={() => navigate("/profile/basic-info")}>
                Skip for now
              </button>
              <p className="car-details-skip-note">You'll need a vehicle before posting a ride.</p>
            </>
          )}
        </div>
      </form>
    </main>
  );
}
