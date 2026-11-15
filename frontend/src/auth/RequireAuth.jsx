import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Login protection is OFF by default so everyone can build pages without logging in.
// Turn it on with VITE_REQUIRE_LOGIN=true in frontend/.env.
const REQUIRE_LOGIN = import.meta.env.VITE_REQUIRE_LOGIN === "true";

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!REQUIRE_LOGIN) return <Outlet />;
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
