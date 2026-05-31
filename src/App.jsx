import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Rooms from "./pages/rooms/Rooms";
import Bookings from "./pages/bookings/Bookings";
import Guests from "./pages/guests/Guests";
import Reports from "./pages/reports/Reports";
import Notifications from "./pages/notifications/Notifications";
import Settings from "./pages/settings/Settings";
import Maintenance from "./pages/maintenance/Maintenance";
import GuestStay from "./pages/guest/GuestStay";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.roleId)) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* Staff routes */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={[1,2,4]}><Dashboard /></ProtectedRoute>} />
      <Route path="/rooms" element={<ProtectedRoute allowedRoles={[1,2,4]}><Rooms /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute allowedRoles={[1,2,4]}><Bookings /></ProtectedRoute>} />
      <Route path="/guests" element={<ProtectedRoute allowedRoles={[1,2,4]}><Guests /></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute allowedRoles={[1,2,4]}><Maintenance /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={[1,2]}><Reports /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute allowedRoles={[1,2,4]}><Notifications /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={[1]}><Settings /></ProtectedRoute>} />

      {/* Guest route */}
      <Route path="/guest/stay" element={<ProtectedRoute allowedRoles={[5]}><GuestStay /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;