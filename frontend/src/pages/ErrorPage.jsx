import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { Button, ConfirmationLayout } from "../components";

// Error / not found: shown at /error and for any unknown URL. Only for failures the user
// can't fix on the spot (a failed list or form shows an inline error with Retry instead).
// No data to load. Back to home goes to Explore, or Login when logged out.
export default function ErrorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <ConfirmationLayout
        icon="error"
        title="Error!"
        subtitle="Something went wrong."
        actions={
          <>
            {/* TODO: placeholder until there's a support email or report form. */}
            <Button variant="secondary" fullWidth>
              Report a problem
            </Button>
            <Button variant="secondary" fullWidth onClick={() => navigate(user ? "/" : "/login", { replace: true })}>
              Back to home
            </Button>
          </>
        }
      />
    </div>
  );
}
