import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, IconButton, Chip, CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notification");
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/api/notification/read/${id}`);
      fetchNotifications();
    } catch (error) {
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight="600">Notifications</Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} unread`} size="small" color="error" />
          )}
        </Box>
        {unreadCount > 0 && (
          <Typography variant="body2" color="primary" sx={{ cursor: "pointer" }} onClick={handleMarkAllRead}>
            Mark all as read
          </Typography>
        )}
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <CardContent>
          {notifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              No notifications
            </Typography>
          ) : (
            notifications.map((n) => (
              <Box
                key={n.notificationId}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 2, px: 1,
                  borderBottom: "1px solid #f0f0f0",
                  backgroundColor: n.isRead ? "transparent" : "#f8f9ff",
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <NotificationsIcon sx={{ color: n.isRead ? "#ccc" : "#1a1a2e" }} />
                  <Box>
                    <Typography variant="body1" fontWeight={n.isRead ? 400 : 600}>
                      {n.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {n.createdAt?.split("T")[0]}
                    </Typography>
                  </Box>
                </Box>
                {!n.isRead && (
                  <IconButton onClick={() => handleMarkRead(n.notificationId)}>
                    <CheckCircleIcon sx={{ color: "#2e7d32" }} />
                  </IconButton>
                )}
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

export default Notifications;