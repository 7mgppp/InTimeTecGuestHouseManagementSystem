import { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Divider } from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BuildIcon from "@mui/icons-material/Build";
import MainLayout from "../../components/layout/MainLayout";
import { getBookingsAPI, getRoomsAPI } from "../../api/api";

const statusColor = {
  Approved:   { bg: "#e8f5e9", color: "#2e7d32" },
  CheckedIn:  { bg: "#e3f2fd", color: "#1565c0" },
  CheckedOut: { bg: "#f3e5f5", color: "#6a1b9a" },
  Cancelled:  { bg: "#ffebee", color: "#c62828" },
  Pending:    { bg: "#fff3e0", color: "#e65100" },
};

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          getRoomsAPI(),
          getBookingsAPI(),
        ]);
        setRooms(roomsRes.data);
        setBookings(bookingsRes.data);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === "Occupied").length;
  const maintenanceCount = rooms.filter(r => r.status === "Maintenance").length;
  const availableRooms = rooms.filter(r => r.status === "Available").length;

  // Only active bookings, newest first, max 5
  const activeBookings = bookings
    .filter(b => ["CheckedIn", "Approved"].includes(b.status))
    .sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate))
    .slice(0, 5);

  const stats = [
    { label: "Total Rooms",     value: totalRooms,       icon: <MeetingRoomIcon sx={{ fontSize: 28, color: "#1a1a2e" }} />, bg: "#e8eaf6" },
    { label: "Occupied Rooms",  value: occupiedRooms,    icon: <PeopleIcon sx={{ fontSize: 28, color: "#2e7d32" }} />,      bg: "#e8f5e9" },
    { label: "Available Rooms", value: availableRooms,   icon: <CalendarMonthIcon sx={{ fontSize: 28, color: "#1565c0" }} />, bg: "#e3f2fd" },
    { label: "Maintenance",     value: maintenanceCount, icon: <BuildIcon sx={{ fontSize: 28, color: "#e65100" }} />,       bg: "#fff3e0" },
  ];

  return (
    <MainLayout>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.10)", border: "1px solid #ececec" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{
                  width: 44, height: 44, backgroundColor: stat.bg,
                  borderRadius: 2, display: "flex", alignItems: "center",
                  justifyContent: "center", mb: 2,
                }}>
                  {stat.icon}
                </Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  {stat.label}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.10)", border: "1px solid #ececec" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="600">
              Active Bookings
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Showing {activeBookings.length} active
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {activeBookings.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              No active bookings
            </Typography>
          ) : (
            activeBookings.map((booking) => (
              <Box key={booking.bookingId} sx={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", py: 2, borderBottom: "1px solid #f5f5f5",
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{
                    width: 38, height: 38, borderRadius: "50%",
                    backgroundColor: "#e8eaf6", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 14, color: "#1a1a2e",
                  }}>
                    {booking.user?.fullName?.charAt(0) || "G"}
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight="500">
                      {booking.user?.fullName || "Guest"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Room {booking.room?.roomNumber} · {booking.checkInDate?.split("T")[0]} → {booking.checkOutDate?.split("T")[0]}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{
                  backgroundColor: statusColor[booking.status]?.bg || "#f5f5f5",
                  color: statusColor[booking.status]?.color || "#333",
                  px: 2, py: 0.5, borderRadius: 5,
                  fontSize: 12, fontWeight: 600, ml: 2, whiteSpace: "nowrap",
                }}>
                  {booking.status?.toUpperCase()}
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

export default Dashboard;