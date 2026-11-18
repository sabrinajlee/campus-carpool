import { Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";

import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import CheckEmail from "./pages/CheckEmail.jsx";
import Explore from "./pages/Explore.jsx";
import RideDetails from "./pages/RideDetails.jsx";
import RequestSent from "./pages/RequestSent.jsx";
import RidePosted from "./pages/RidePosted.jsx";
import RideCancelled from "./pages/RideCancelled.jsx";
import RideCompleted from "./pages/RideCompleted.jsx";
import PostRide from "./pages/PostRide.jsx";
import PickupDropoff from "./pages/PickupDropoff.jsx";
import MyTrips from "./pages/MyTrips.jsx";
import Messages from "./pages/Messages.jsx";
import Profile from "./pages/Profile.jsx";
import BasicInfo from "./pages/BasicInfo.jsx";
import CarDetails from "./pages/CarDetails.jsx";
import TravelPreferences from "./pages/TravelPreferences.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import RequireAuth from "./auth/RequireAuth.jsx";
import { useAuth } from "./auth/AuthContext.jsx";

// "/" is the landing page. While the user is onboarding (user.phone is null) it shows
// Travel preferences, with no bottom nav. Otherwise it's Explore inside AppLayout.
function Landing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && !user.phone) return <TravelPreferences />;
  return <AppLayout />;
}

// All routes live here. Add new pages in a separate small PR to avoid conflicts.
export default function App() {
  return (
    <Routes>
      {/* No login needed, no bottom nav */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/error" element={<ErrorPage />} />

      {/* Needs login */}
      <Route element={<RequireAuth />}>
        {/* No bottom nav: confirmation screens (/rides/:id/<past tense>) and the completion question */}
        <Route path="/rides/:id/requested" element={<RequestSent />} />
        <Route path="/rides/:id/posted" element={<RidePosted />} />
        <Route path="/rides/:id/cancelled" element={<RideCancelled />} />
        <Route path="/rides/:id/complete" element={<RideCompleted />} />

        {/* Landing: Travel preferences while onboarding, else Explore */}
        <Route path="/" element={<Landing />}>
          <Route index element={<Explore />} />
        </Route>

        {/* With bottom nav */}
        <Route element={<AppLayout />}>
          {/* Ride details: the rider's view, or the driver's view of their own ride (requests, confirmed riders) */}
          <Route path="/rides/:id" element={<RideDetails />} />
          <Route path="/post" element={<PostRide />} />
          <Route path="/post/pickup" element={<PickupDropoff />} />
          <Route path="/trips" element={<MyTrips />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/basic-info" element={<BasicInfo />} />
          <Route path="/profile/vehicle" element={<CarDetails />} />
        </Route>
      </Route>

      {/* Any unknown URL */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
