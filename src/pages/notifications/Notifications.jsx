import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, IconButton, Chip, CircularProgress, Divider,
} from "@mui/material";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import BuildIcon from "@mui/icons-material/Build";
import MainLayout from "../../components/layout/MainLayout";
import { getBookingsAPI, getMaintenanceAPI } from "../../api/api";

// ─── Persistence helpers ───────────────────────────────────────────────
// TODO: swap these two functions with API calls when backend implements it
const getReadIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem("gh_read_notifs") || "[]"));
  } catch { return new Set(); }
};
const saveReadIds = (ids) => {
  localStorage.setItem("gh_read_notifs", JSON.stringify([...ids]));
};
// ──────────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  CheckedIn:  { color: "#1565c0", bg: "#e3f2fd", label: "Checked In"  },
  CheckedOut: { color: "#e65100", bg: "#fff3e0", label: "Checked Out" },
  Approved:   { color: "#2e7d32", bg: "#e8f5e9", label: "Approved"    },
  Cancelled:  { color: "#c62828", bg: "#fce4ec", label: "Cancelled"   },
  Completed:  { color: "#2e7d32", bg: "#e8f5e9", label: "Completed"   },
  Open:       { color: "#e65100", bg: "#fff3e0", label: "Open"        },
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(getReadIds());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buildNotifications();
  }, []);

  const buildNotifications = async () => {
    try {
      const [bookingsRes, maintRes] = await Promise.all([
        getBookingsAPI(),
        getMaintenanceAPI(),
      ]);

      const bookingNotifs = bookingsRes.data.map((b) => ({
        id: `booking-${b.bookingId}`,
        title: b.status === "CheckedIn"  ? "Guest Checked In"   :
               b.status === "CheckedOut" ? "Guest Checked Out"  :
               b.status === "Approved"   ? "Booking Approved"   :
               b.status === "Cancelled"  ? "Booking Cancelled"  : "New Booking",
        message: `${b.user?.fullName || "A guest"} — Room ${b.room?.roomNumber}`,
        detail: `${b.checkInDate?.split("T")[0]} → ${b.checkOutDate?.split("T")[0]}`,
        createdAt: b.createdAt,
        type: b.status,
        icon: "booking",
      }));

      const maintNotifs = maintRes.data.map((m) => ({
        id: `maint-${m.maintenanceId}`,
        title: m.status === "Completed" ? "Maintenance Completed" : "Maintenance Reported",
        message: m.reason,
        detail: `Room ${m.roomNumber}`,
        createdAt: m.createdAt,
        type: m.status,
        icon: "maintenance",
      }));

      const all = [...bookingNotifs, ...maintNotifs].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setNotifications(all);
    } catch (error) {
      console.error("Error building notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markRead = (id) => {
    const updated = new Set(readIds);
    updated.add(id);
    setReadIds(updated);
    saveReadIds(updated); // persists across reload
  };

  const markAllRead = () => {
    const updated = new Set(notifications.map((n) => n.id));
    setReadIds(updated);
    saveReadIds(updated); // persists across reload
  };

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h6" fontWeight="600">Notifications</Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} unread`} size="small" color="error" />
          )}
        </Box>
        {unreadCount > 0 && (
          <Typography
            variant="body2" color="primary"
            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
            onClick={markAllRead}
          >
            Mark all as read
          </Typography>
        )}
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>
              No notifications
            </Typography>
          ) : (
            notifications.map((n, idx) => {
              const isRead = readIds.has(n.id);
              const cfg = TYPE_CONFIG[n.type] || { color: "#555", bg: "#f5f5f5", label: n.type };
              return (
                <Box key={n.id}>
                  <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 3,
                    py: 2,
                    backgroundColor: isRead ? "transparent" : "#f8f9ff",
                    transition: "background-color 0.2s",
                  }}>
                    {/* Icon */}
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 2,
                      backgroundColor: cfg.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {n.icon === "maintenance"
                        ? <BuildIcon sx={{ color: cfg.color, fontSize: 20 }} />
                        : <NotificationsActiveIcon sx={{ color: cfg.color, fontSize: 20 }} />
                      }
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
                        <Typography variant="body2" fontWeight={isRead ? 400 : 700} noWrap>
                          {n.title}
                        </Typography>
                        <Box sx={{
                          px: 1, py: 0.1, borderRadius: 3,
                          backgroundColor: cfg.bg, color: cfg.color,
                          fontSize: 11, fontWeight: 600, flexShrink: 0,
                        }}>
                          {cfg.label}
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {n.message}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1.5, mt: 0.3 }}>
                        <Typography variant="caption" color="text.disabled">
                          {n.detail}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">·</Typography>
                        <Typography variant="caption" color="text.disabled">
                          {n.createdAt?.split("T")[0]}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Mark read button */}
                    <IconButton
                      size="small"
                      onClick={() => !isRead && markRead(n.id)}
                      sx={{ flexShrink: 0 }}
                      title={isRead ? "Read" : "Mark as read"}
                    >
                      {isRead
                        ? <CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 22 }} />
                        : <RadioButtonUncheckedIcon sx={{ color: "#bbb", fontSize: 22 }} />
                      }
                    </IconButton>
                  </Box>
                  {idx < notifications.length - 1 && <Divider />}
                </Box>
              );
            })
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

export default Notifications;