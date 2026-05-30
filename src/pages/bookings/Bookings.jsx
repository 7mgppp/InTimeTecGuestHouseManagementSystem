import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { getBookingsAPI, createBookingAPI, getAvailableRoomsAPI, approveBookingAPI, cancelBookingAPI, checkInAPI, checkOutAPI } from "../../api/api";

const statusColor = {
  Pending: { bg: "#fff3e0", color: "#e65100" },
  Approved: { bg: "#e8f5e9", color: "#2e7d32" },
  Confirmed: { bg: "#e8f5e9", color: "#2e7d32" },
  CheckedIn: { bg: "#e3f2fd", color: "#1565c0" },
  CheckedOut: { bg: "#f3e5f5", color: "#6a1b9a" },
  Cancelled: { bg: "#ffebee", color: "#c62828" },
};

function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [newBooking, setNewBooking] = useState({
    roomType: "Single",
    checkInDate: "",
    checkOutDate: "",
  });

  const canAdd = [1, 2, 4, 5].includes(user?.roleId);

  useEffect(() => {
    fetchBookings();
    fetchAvailableRooms();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await getBookingsAPI();
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const res = await getAvailableRoomsAPI();
      setAvailableRooms(res.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleCreateBooking = async () => {
    if (!newBooking.checkInDate || !newBooking.checkOutDate) return;
    try {
      const payload = {
        userId: user?.userId,
        roomType: newBooking.roomType,
        checkInDate: new Date(newBooking.checkInDate).toISOString(),
        checkOutDate: new Date(newBooking.checkOutDate).toISOString(),
      };
      console.log("Booking payload:", payload);
      await createBookingAPI(payload);
      setOpenAdd(false);
      setNewBooking({ roomType: "Single", checkInDate: "", checkOutDate: "" });
      fetchBookings();
    } catch (error) {
      console.error("Error creating booking:", error.response?.data);
    }
  };

  const handleAction = async (action, id) => {
    try {
      if (action === "approve") await approveBookingAPI(id);
      if (action === "checkin") await checkInAPI(id);
      if (action === "checkout") await checkOutAPI(id);
      if (action === "cancel") await cancelBookingAPI(id);
      fetchBookings();
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
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        {canAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAdd(true)}
            sx={{ backgroundColor: "#1a1a2e" }}
          >
            New Booking
          </Button>
        )}
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><b>#</b></TableCell>
                  <TableCell><b>Guest</b></TableCell>
                  <TableCell><b>Room</b></TableCell>
                  <TableCell><b>Check In</b></TableCell>
                  <TableCell><b>Check Out</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.bookingId} hover>
                      <TableCell>{booking.bookingId}</TableCell>
                      <TableCell>{booking.user?.fullName}</TableCell>
                      <TableCell>Room {booking.room?.roomNumber}</TableCell>
                      <TableCell>{booking.checkInDate?.split("T")[0]}</TableCell>
                      <TableCell>{booking.checkOutDate?.split("T")[0]}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "inline-block",
                            backgroundColor: statusColor[booking.status]?.bg || "#f5f5f5",
                            color: statusColor[booking.status]?.color || "#333",
                            px: 1.5, py: 0.3, borderRadius: 5, fontSize: 12, fontWeight: 600,
                          }}
                        >
                          {booking.status?.toUpperCase()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {booking.status === "Pending" && [1, 2].includes(user?.roleId) && (
                            <Button size="small" variant="outlined" color="success"
                              onClick={() => handleAction("approve", booking.bookingId)}>
                              Approve
                            </Button>
                          )}
                          {booking.status === "Approved" && [1, 2, 4].includes(user?.roleId) && (
                            <Button size="small" variant="outlined" color="primary"
                              onClick={() => handleAction("checkin", booking.bookingId)}>
                              Check In
                            </Button>
                          )}
                          {booking.status === "CheckedIn" && [1, 2, 4].includes(user?.roleId) && (
                            <Button size="small" variant="outlined" color="secondary"
                              onClick={() => handleAction("checkout", booking.bookingId)}>
                              Check Out
                            </Button>
                          )}
                          {["Pending", "Approved"].includes(booking.status) && [1, 2].includes(user?.roleId) && (
                            <Button size="small" variant="outlined" color="error"
                              onClick={() => handleAction("cancel", booking.bookingId)}>
                              Cancel
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold">New Booking</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Room Type</InputLabel>
            <Select
              value={newBooking.roomType}
              label="Room Type"
              onChange={(e) => setNewBooking({ ...newBooking, roomType: e.target.value })}
            >
              <MenuItem value="Single">Single</MenuItem>
              <MenuItem value="Double">Double</MenuItem>
              <MenuItem value="Suite">Suite</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth label="Check In" type="date"
            InputLabelProps={{ shrink: true }}
            value={newBooking.checkInDate}
            onChange={(e) => setNewBooking({ ...newBooking, checkInDate: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth label="Check Out" type="date"
            InputLabelProps={{ shrink: true }}
            value={newBooking.checkOutDate}
            onChange={(e) => setNewBooking({ ...newBooking, checkOutDate: e.target.value })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateBooking} sx={{ backgroundColor: "#1a1a2e" }}>
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

export default Bookings;