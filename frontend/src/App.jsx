import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";

import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import CheckEmail from "./pages/CheckEmail.jsx";
import Explore from "./pages/Explore.jsx";
import RideDetails from "./pages/RideDetails.jsx";
import RequestSent from "./pages/RequestSent.jsx";
import PostRide from "./pages/PostRide.jsx";
import PickupDropoff from "./pages/PickupDropoff.jsx";
import MyTrips from "./pages/MyTrips.jsx";
import ManageRequests from "./pages/ManageRequests.jsx";
import Messages from "./pages/Messages.jsx";
import Profile from "./pages/Profile.jsx";

// All routes live here. Add new pages in a separate small PR to avoid conflicts.
export default function App() {
  return (
    <Routes>
      {/* No bottom nav */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/rides/:id/requested" element={<RequestSent />} />

      {/* With bottom nav */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Explore />} />
        <Route path="/rides/:id" element={<RideDetails />} />
        <Route path="/post" element={<PostRide />} />
        <Route path="/post/pickup" element={<PickupDropoff />} />
        <Route path="/trips" element={<MyTrips />} />
        <Route path="/trips/:id/requests" element={<ManageRequests />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
