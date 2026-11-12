import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";

// Pages inside this layout get the bottom nav.
export default function AppLayout() {
  return (
    <div className="app-shell app-shell--with-nav">
      <Outlet />
      <BottomNav />
    </div>
  );
}
