import { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BuildIcon from "@mui/icons-material/Build";
import MainLayout from "../../components/layout/MainLayout";
import { getDashboardSummaryAPI, getMonthlyBookingsAPI } from "../../api/api";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, bookingsRes] = await Promise.all([
          getDashboardSummaryAPI(),
          getMonthlyBookingsAPI(),
        ]);
        setSummary(summaryRes.data);
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

  const stats = [
    {
      label: "Total Rooms",
      value: summary?.totalRooms || 0,
      icon: <MeetingRoomIcon sx={{ fontSize: 40, color: "#1a1a2e" }} />,
      bg: "#e8eaf6",
    },
    {
      label: "Occupied Rooms",
      value: summary?.occupiedRooms || 0,
      icon: <PeopleIcon sx={{ fontSize: 40, color: "#2e7d32" }} />,
      bg: "#e8f5e9",
    },
    {
      label: "Available Rooms",
      value: summary?.availableRooms || 0,
      icon: <CalendarMonthIcon sx={{ fontSize: 40, color: "#1565c0" }} />,
      bg: "#e3f2fd",
    },
    {
      label: "Maintenance",
      value: summary?.maintenanceRooms || 0,
      icon: <BuildIcon sx={{ fontSize: 40, color: "#e65100" }} />,
      bg: "#fff3e0",
    },
  ];

  return (
    <MainLayout>
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ backgroundColor: stat.bg, borderRadius: 3, p: 1.5 }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Bookings */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" mb={2}>
            Monthly Bookings
          </Typography>
          {bookings.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              No bookings this month
            </Typography>
          ) : (
            bookings.map((booking) => (
              <Box
                key={booking.bookingId}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1.5,
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="500">
                    {booking.user?.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Room {booking.room?.roomNumber} · {booking.checkInDate?.split("T")[0]} → {booking.checkOutDate?.split("T")[0]}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: booking.status === "Confirmed" ? "#e8f5e9" : "#fff3e0",
                    color: booking.status === "Confirmed" ? "#2e7d32" : "#e65100",
                    px: 2,
                    py: 0.5,
                    borderRadius: 5,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
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