import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Alert, Avatar, Button, Card, PageHeader } from "../components";
import "./Profile.css";

// My profile: who is logged in, links to the profile pages, and Logout.
// The user comes from the auth context, which loads GET /api/auth/me:
//
// { "user": { "id": 1, "name": "Jane Doe", "email": "jane@uwo.ca",
//             "is_verified": true, "contact_pref": "email", "phone": "519-555-0123" } }
//
// Logout calls POST /api/auth/logout (through the auth context), then goes to /login.

// ---------- Sample data for testing ----------
// Login isn't required while building pages (VITE_REQUIRE_LOGIN), so with nobody
// logged in the page shows this user instead of an empty card.
const SAMPLE_USER = { id: 1, name: "Jane Doe", email: "jane@uwo.ca", is_verified: true, phone: null };

// Ride history and Connections are later features: shown, but not linked.
const ROWS = [
  { title: "Basic Information", subtitle: "Name, Phone number", to: "/profile/basic-info" },
  { title: "Car Details", subtitle: "For posting rides", to: "/profile/vehicle" },
  { title: "My ride history", subtitle: "View previous rides" },
  { title: "Past connections", subtitle: "View connected drivers and passengers" },
];

function ProfileRow({ title, subtitle, to }) {
  const text = (
    <span className="profile-row-text">
      <span className="profile-row-title">{title}</span>
      <span className="profile-row-subtitle">{subtitle}</span>
    </span>
  );

  if (!to) {
    return (
      <li className="profile-row profile-row--soon">
        {text}
        <span className="profile-row-soon">Coming soon</span>
      </li>
    );
  }

  return (
    <li>
      <Link className="profile-row" to={to}>
        {text}
        <ChevronRight className="profile-row-chevron" size={18} aria-hidden="true" />
      </Link>
    </li>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, loading, logout } = useAuth();
  const user = authUser ?? SAMPLE_USER;

  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoggingOut(true);
    setError("");
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setError("Couldn't log you out. Check your connection and try again.");
      setLoggingOut(false);
    }
  }

  return (
    <main className="page">
      <PageHeader title="My profile" />

      {loading ? (
        <p className="profile-status">Loading your profile…</p>
      ) : (
        <>
          <Card className="profile-card">
            <Avatar name={user.name} size="lg" />
            <h2 className="profile-name">{user.name}</h2>
            {/* Only verified accounts can log in, so this is always shown. */}
            <p className="profile-verified">Verified Western student</p>
          </Card>

          <section className="profile-section" aria-labelledby="profile-account-title">
            <h2 id="profile-account-title" className="profile-section-title">
              Account
            </h2>
            <ul className="profile-list">
              {ROWS.map((row) => (
                <ProfileRow key={row.title} {...row} />
              ))}
            </ul>
          </section>

          {error && <Alert type="error">{error}</Alert>}

          <Button variant="danger" fullWidth className="profile-logout" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out…" : "Logout"}
          </Button>
        </>
      )}
    </main>
  );
}
