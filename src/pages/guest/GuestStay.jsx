import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, CircularProgress, Divider,
} from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { getBookingsAPI } from "../../api/api";

function GuestStay() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const res = await getBookingsAPI();
      const myBookings = res.data.filter(b => b.userId === user?.userId);
      setBookings(myBookings);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    Pending: { bg: "#fff3e0", color: "#e65100" },
    Approved: { bg: "#e8f5e9", color: "#2e7d32" },
    CheckedIn: { bg: "#e3f2fd", color: "#1565c0" },
    CheckedOut: { bg: "#f3e5f5", color: "#6a1b9a" },
    Cancelled: { bg: "#ffebee", color: "#c62828" },
  };

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
      <Typography variant="h5" fontWeight="bold" mb={3}>
        My Stay
      </Typography>

      {bookings.length === 0 ? (
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              You have no bookings yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        bookings.map((booking) => (
          <Card key={booking.bookingId} sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)", mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Room {booking.room?.roomNumber}
                </Typography>
                <Box
                  sx={{
                    backgroundColor: statusColor[booking.status]?.bg || "#f5f5f5",
                    color: statusColor[booking.status]?.color || "#333",
                    px: 2, py: 0.5, borderRadius: 5, fontSize: 12, fontWeight: 600,
                  }}
                >
                  {booking.status?.toUpperCase()}
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", gap: 4 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Check In</Typography>
                  <Typography variant="body1" fontWeight="500">
                    {booking.checkInDate?.split("T")[0]}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Check Out</Typography>
                  <Typography variant="body1" fontWeight="500">
                    {booking.checkOutDate?.split("T")[0]}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Room Type</Typography>
                  <Typography variant="body1" fontWeight="500">
                    {booking.room?.roomType}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </MainLayout>
  );
}

export default GuestStay;