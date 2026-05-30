import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import BuildIcon from "@mui/icons-material/Build";

const allNavItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard", roles: [1, 2, 3, 4] },
  { label: "Rooms", icon: <MeetingRoomIcon />, path: "/rooms", roles: [1, 2, 3, 4] },
  { label: "Bookings", icon: <CalendarMonthIcon />, path: "/bookings", roles: [1, 2, 3, 4] },
  { label: "Guests", icon: <PeopleIcon />, path: "/guests", roles: [1, 2, 4] },
  { label: "Maintenance", icon: <BuildIcon />, path: "/maintenance", roles: [1, 2, 3, 4] },
  { label: "Reports", icon: <AssessmentIcon />, path: "/reports", roles: [1, 2] },
  { label: "Notifications", icon: <NotificationsIcon />, path: "/notifications", roles: [1, 2, 3, 4] },
  { label: "Settings", icon: <SettingsIcon />, path: "/settings", roles: [1] },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = allNavItems.filter((item) =>
    item.roles.includes(user?.roleId)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        width: 240,
        minHeight: "100vh",
        backgroundColor: "#1a1a2e",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" color="#fff">
          🏨 Guest House
        </Typography>
        <Typography variant="caption" color="rgba(255,255,255,0.5)">
          {user?.fullName}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      <List sx={{ flex: 1, px: 1, mt: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? "#fff" : "rgba(255,255,255,0.6)", minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontSize: 14,
                      color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      <List sx={{ px: 1, mb: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{ borderRadius: 2, "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
          >
            <ListItemIcon sx={{ color: "rgba(255,255,255,0.6)", minWidth: 36 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{ "& .MuiListItemText-primary": { fontSize: 14, color: "rgba(255,255,255,0.6)" } }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}

export default Sidebar;