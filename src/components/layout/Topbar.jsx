import { Box, Typography, IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/rooms": "Room Management",
  "/bookings": "Bookings & Reservations",
  "/guests": "Guest Management",
  "/maintenance": "Maintenance",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

function Topbar() {
  const { user } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Guest House";

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
        <IconButton>
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
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