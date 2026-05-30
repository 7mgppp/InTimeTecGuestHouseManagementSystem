import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography,
} from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { getBookingsAPI, checkInAPI, checkOutAPI } from "../../api/api";

function Guests() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const res = await getBookingsAPI();
      setBookings(res.data.filter(b => ["Approved", "CheckedIn"].includes(b.status)));
    } catch (error) {
      console.error("Error fetching guests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, id) => {
    try {
      if (action === "checkin") await checkInAPI(id);
      if (action === "checkout") await checkOutAPI(id);
      fetchGuests();
    } catch (error) {
      console.error("Error:", error);
    }
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
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><b>#</b></TableCell>
                  <TableCell><b>Full Name</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Room</b></TableCell>
                  <TableCell><b>Check In</b></TableCell>
                  <TableCell><b>Check Out</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell><b>Action</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No guests found
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.bookingId} hover>
                      <TableCell>{booking.bookingId}</TableCell>
                      <TableCell>{booking.user?.fullName}</TableCell>
                      <TableCell>{booking.user?.email}</TableCell>
                      <TableCell>Room {booking.room?.roomNumber}</TableCell>
                      <TableCell>{booking.checkInDate?.split("T")[0]}</TableCell>
                      <TableCell>{booking.checkOutDate?.split("T")[0]}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "inline-block",
                            backgroundColor: booking.status === "CheckedIn" ? "#e8f5e9" : "#e3f2fd",
                            color: booking.status === "CheckedIn" ? "#2e7d32" : "#1565c0",
                            px: 1.5, py: 0.3, borderRadius: 5, fontSize: 12, fontWeight: 600,
                          }}
                        >
                          {booking.status?.toUpperCase()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {booking.status === "Approved" && (
                          <Button size="small" variant="outlined" color="primary"
                            onClick={() => handleAction("checkin", booking.bookingId)}>
                            Check In
                          </Button>
                        )}
                        {booking.status === "CheckedIn" && (
                          <Button size="small" variant="outlined" color="error"
                            onClick={() => handleAction("checkout", booking.bookingId)}>
                            Check Out
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

export default Guests;