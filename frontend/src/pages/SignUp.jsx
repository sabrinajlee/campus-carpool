import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextInput } from "../components";
import { signup } from "../auth/authApi";
import "./Auth.css";

// Owner: Ellie — see docs/frontend.md
export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!form.email.trim().toLowerCase().endsWith("@uwo.ca")) next.email = "Use your @uwo.ca email.";
    if (form.password.length < 8) next.password = "At least 8 characters.";
    if (form.confirm !== form.password) next.confirm = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = await signup(form.name.trim(), form.email.trim(), form.password);
      navigate("/check-email", { state: { email: data.email } });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <main className="auth-page">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Only Western students can join.</p>

        {serverError && <div className="auth-alert auth-alert--error">{serverError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextInput label="Name" autoComplete="name" value={form.name} onChange={update("name")} error={errors.name} />
          <TextInput
            label="Western email"
            type="email"
            autoComplete="email"
            placeholder="you@uwo.ca"
            value={form.email}
            onChange={update("email")}
            error={errors.email}
          />
          <TextInput
            label="Password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={update("password")}
            error={errors.password}
          />
          <TextInput
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={update("confirm")}
            error={errors.confirm}
          />
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </main>
    </div>
  );
}
