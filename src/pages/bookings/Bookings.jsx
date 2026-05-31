import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Alert, Tabs, Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import {
  getBookingsAPI, createBookingAPI, approveBookingAPI, cancelBookingAPI,
  checkInAPI, checkOutAPI, markMaintenanceAPI, markAvailableAPI
} from "../../api/api";

const statusColor = {
  Pending:    { bg: "#fff3e0", color: "#e65100" },
  Approved:   { bg: "#e8f5e9", color: "#2e7d32" },
  Confirmed:  { bg: "#e8f5e9", color: "#2e7d32" },
  CheckedIn:  { bg: "#e3f2fd", color: "#1565c0" },
  CheckedOut: { bg: "#f3e5f5", color: "#6a1b9a" },
  Cancelled:  { bg: "#ffebee", color: "#c62828" },
};

function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [tab, setTab] = useState(0);
  const [newBooking, setNewBooking] = useState({
    roomType: "Single",
    checkInDate: "",
    checkOutDate: "",
  });

  const canAdd = [1, 2, 4, 5].includes(user?.roleId);

  useEffect(() => {
    fetchBookings();
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

  const handleCreateBooking = async () => {
    if (!newBooking.checkInDate || !newBooking.checkOutDate) {
      setBookingError("Please select check-in and check-out dates.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setBookingError("");
    try {
      const payload = {
        userId: user?.userId,
        roomType: newBooking.roomType,
        checkInDate: new Date(newBooking.checkInDate).toISOString(),
        checkOutDate: new Date(newBooking.checkOutDate).toISOString(),
      };
      await createBookingAPI(payload);
      setOpenAdd(false);
      setNewBooking({ roomType: "Single", checkInDate: "", checkOutDate: "" });
      fetchBookings();
    } catch (error) {
      const msg = error.response?.data;
      setBookingError(
        typeof msg === "string" ? msg : "No available rooms for the selected dates and room type."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (action, id) => {
    try {
      const booking = bookings.find(b => b.bookingId === id);
      const roomId = booking?.room?.roomId;

      if (action === "approve") await approveBookingAPI(id);
      if (action === "checkin") {
        await checkInAPI(id);
        if (roomId) await markMaintenanceAPI(roomId).catch(() => {});
      }
      if (action === "checkout") {
        await checkOutAPI(id);
        if (roomId) await markAvailableAPI(roomId).catch(() => {});
      }
      if (action === "cancel") {
        await cancelBookingAPI(id);
        if (roomId) await markAvailableAPI(roomId).catch(() => {});
      }
      fetchBookings();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setOpenAdd(false);
    setBookingError("");
    setNewBooking({ roomType: "Single", checkInDate: "", checkOutDate: "" });
  };

  const filteredBookings = bookings.filter(b => {
    if (tab === 0) return true; // All
    if (tab === 1) return ["Pending", "Approved", "CheckedIn"].includes(b.status); // Active
    if (tab === 2) return ["CheckedOut", "Cancelled"].includes(b.status); // Completed
    return true;
  });

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
            onClick={() => { setOpenAdd(true); setBookingError(""); }}
            sx={{ backgroundColor: "#1a1a2e" }}
          >
            New Booking
          </Button>
        )}
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <Box sx={{ borderBottom: "1px solid #e0e0e0", px: 2 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label={`All (${bookings.length})`} />
            <Tab label={`Active (${bookings.filter(b => ["Pending","Approved","CheckedIn"].includes(b.status)).length})`} />
            <Tab label={`Completed (${bookings.filter(b => ["CheckedOut","Cancelled"].includes(b.status)).length})`} />
          </Tabs>
        </Box>
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
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.bookingId} hover>
                      <TableCell>{booking.bookingId}</TableCell>
                      <TableCell>{booking.user?.fullName}</TableCell>
                      <TableCell>Room {booking.room?.roomNumber}</TableCell>
                      <TableCell>{booking.checkInDate?.split("T")[0]}</TableCell>
                      <TableCell>{booking.checkOutDate?.split("T")[0]}</TableCell>
                      <TableCell>
                        <Box sx={{
                          display: "inline-block",
                          backgroundColor: statusColor[booking.status]?.bg || "#f5f5f5",
                          color: statusColor[booking.status]?.color || "#333",
                          px: 1.5, py: 0.3, borderRadius: 5, fontSize: 12, fontWeight: 600,
                        }}>
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

      <Dialog open={openAdd} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold">New Booking</DialogTitle>
        <DialogContent>
          {bookingError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {bookingError}
            </Alert>
          )}
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
          <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateBooking}
            disabled={submitting}
            sx={{ backgroundColor: "#1a1a2e" }}
          >
            {submitting ? "Booking..." : "Confirm Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

export default Bookings;