import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components";
import { resendVerification } from "../auth/authApi";
import "./Auth.css";

// Owner: Ellie — see docs/frontend.md

// "jane@uwo.ca" -> "j***@uwo.ca"
function maskEmail(email) {
  const [name, domain] = email.split("@");
  return `${name[0]}***@${domain}`;
}

export default function CheckEmail() {
  const email = useLocation().state?.email;
  const [message, setMessage] = useState(null);
  const [sending, setSending] = useState(false);

  async function handleResend() {
    setSending(true);
    try {
      await resendVerification(email);
      setMessage("A new link is on its way.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="app-shell">
      <main className="auth-page">
        <div className="auth-logo" aria-hidden="true" />
        <h1 className="auth-title">Check your email</h1>
        <p className="auth-subtitle">
          {email ? (
            <>
              We sent a verification link to <strong>{maskEmail(email)}</strong>.
              <br />
              Your account becomes active once you click it. The link expires in 24 hours.
            </>
          ) : (
            "We sent you a verification link. Your account becomes active once you click it."
          )}
        </p>

        {message && <div className="auth-alert auth-alert--success">{message}</div>}

        {email && (
          <Button variant="secondary" fullWidth onClick={handleResend} disabled={sending}>
            {sending ? "Sending..." : "Resend email"}
          </Button>
        )}

        <p className="auth-footer">
          Wrong email? <Link to="/signup">Go back</Link> · <Link to="/login">Log in</Link>
        </p>
      </main>
    </div>
  );
}
