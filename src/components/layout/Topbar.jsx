import { Box, Typography, IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBookingsAPI, getMaintenanceAPI } from "../../api/api";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/rooms": "Room Management",
  "/bookings": "Bookings & Reservations",
  "/guests": "Guest Management",
  "/maintenance": "Maintenance",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/guest/stay": "My Stay",
};

function Topbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || "Guest House";
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.roleId !== 5) {
      fetchUnreadCount();
    }
  }, [location.pathname]);

  const fetchUnreadCount = async () => {
    try {
      const readIds = new Set(JSON.parse(localStorage.getItem("gh_read_notifs") || "[]"));
      const [bookingsRes, maintRes] = await Promise.all([
        getBookingsAPI(),
        getMaintenanceAPI(),
      ]);
      const unreadBookings = bookingsRes.data.filter(
        (b) => !readIds.has(`booking-${b.bookingId}`)
      ).length;
      const unreadMaint = maintRes.data.filter(
        (m) => !readIds.has(`maint-${m.maintenanceId}`)
      ).length;
      setUnreadCount(unreadBookings + unreadMaint);
    } catch {
      setUnreadCount(0);
    }
  };

  return (
    <Box
      sx={{
        height: 64,
        backgroundColor: "#fff",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        position: "fixed",
        top: 0,
        left: 240,
        right: 0,
        zIndex: 100,
      }}
    >
      <Typography variant="h6" fontWeight="600" color="#1a1a2e">
        {title}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Hide notification bell for Guest */}
        {user?.roleId !== 5 && (
          <IconButton onClick={() => navigate("/notifications")}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        )}
        <IconButton>
          <AccountCircleIcon />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {user?.fullName}
        </Typography>
      </Box>
    </Box>
  );
}

export default Topbar;