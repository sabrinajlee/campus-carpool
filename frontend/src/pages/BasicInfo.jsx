import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateMe } from "../api";
import { Alert, Button, PageHeader, TextInput } from "../components";
import { useAuth } from "../auth/AuthContext.jsx";
import "./BasicInfo.css";

// Basic information (/profile/basic-info).
// Onboarding (user.phone is null): name can still be set, button says Continue and goes to /.
// From My profile: name is read-only, button says Save Changes and goes back to /profile.
// Saves with PATCH /api/me { name?, phone }, which returns { user } (not built in the backend yet).
// The returned user goes into the auth context, so "/" sees the new phone number and shows
// Explore instead of Travel preferences (onboarding ends once user.phone is set).

function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

function validate(form, onboarding) {
  const errors = {};
  if (onboarding && !form.name.trim()) errors.name = "Add your full name.";
  const phone = digitsOnly(form.phone);
  if (!phone) errors.phone = "Add a phone number.";
  else if (phone.length !== 10) errors.phone = "Enter a 10-digit phone number.";
  return errors;
}

export default function BasicInfo() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const onboarding = !user?.phone;

  const [form, setForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitError("");

    const next = validate(form, onboarding);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const body = { phone: digitsOnly(form.phone) };
    if (onboarding) body.name = form.name.trim();

    setSubmitting(true);
    try {
      setUser(await updateMe(body));
      navigate(onboarding ? "/" : "/profile", { replace: onboarding });
    } catch {
      setSubmitError("Couldn't save your details. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="page basic-info-page">
      <PageHeader title="Basic Information" showBack />
      <p className="basic-info-intro">
        Your name will be visible in rides you post, other details are only visible to accepted riders.
      </p>

      <form className="basic-info-form" onSubmit={handleSubmit} noValidate>
        <TextInput label="UWO email" type="email" value={user?.email ?? ""} readOnly />
        <TextInput
          label="Full name"
          value={form.name}
          onChange={update("name")}
          readOnly={!onboarding}
          helper={onboarding ? "You cannot change this later!" : undefined}
          error={errors.name}
          autoComplete="name"
        />
        <TextInput
          label="Phone number"
          type="tel"
          inputMode="tel"
          placeholder="6475550123"
          value={form.phone}
          onChange={update("phone")}
          helper="You can edit this later."
          error={errors.phone}
          autoComplete="tel"
        />

        {submitError && <Alert type="error">{submitError}</Alert>}

        <Button type="submit" fullWidth disabled={submitting} className="basic-info-submit">
          {submitting ? "Saving…" : onboarding ? "Continue" : "Save Changes"}
        </Button>
      </form>
    </main>
  );
}
