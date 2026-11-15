import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button, TextInput } from "../components";
import { useAuth } from "../auth/AuthContext";
import { resendVerification } from "../auth/authApi";
import "./Auth.css";

// Owner: Ellie — see docs/frontend.md

// Messages for the ?verify=... result after clicking the email link
const VERIFY_MESSAGES = {
  success: { type: "success", text: "Your email is verified. You can log in now." },
  expired: { type: "error", text: "That link has expired. Log in to get a new one." },
  invalid: { type: "error", text: "That link isn't valid. Log in to get a new one." },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [info, setInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const verifyMessage = VERIFY_MESSAGES[searchParams.get("verify")];

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setNeedsVerify(false);

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from ?? "/", { replace: true });
    } catch (err) {
      setError(err.message);
      setNeedsVerify(err.code === "EMAIL_NOT_VERIFIED");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    await resendVerification(email);
    setInfo("A new verification link has been sent. Check your email.");
  }

  return (
    <div className="app-shell">
      <main className="auth-page">
        <div className="auth-logo" aria-hidden="true" />
        <h1 className="auth-title">Carpool</h1>
        <p className="auth-subtitle">Ride with fellow Western students.</p>

        {verifyMessage && !error && (
          <div className={`auth-alert auth-alert--${verifyMessage.type}`}>{verifyMessage.text}</div>
        )}
        {error && (
          <div className="auth-alert auth-alert--error">
            {error}{" "}
            {needsVerify && (
              <button type="button" className="auth-link-button" onClick={handleResend}>
                Resend link
              </button>
            )}
          </div>
        )}
        {info && <div className="auth-alert auth-alert--info">{info}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextInput
            label="Western email"
            type="email"
            autoComplete="email"
            placeholder="you@uwo.ca"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextInput
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </main>
    </div>
  );
}
