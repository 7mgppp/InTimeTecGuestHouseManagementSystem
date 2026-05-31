import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Alert, Tabs, Tab, Typography, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import {
  getBookingsAPI, createBookingAPI, approveBookingAPI, cancelBookingAPI,
  checkInAPI, checkOutAPI, markMaintenanceAPI, markAvailableAPI, getRoomsAPI
} from "../../api/api";

const statusColor = {
  Pending:    { bg: "#fff3e0", color: "#e65100" },
  Approved:   { bg: "#e8f5e9", color: "#2e7d32" },
  Confirmed:  { bg: "#e8f5e9", color: "#2e7d32" },
  CheckedIn:  { bg: "#e3f2fd", color: "#1565c0" },
  CheckedOut: { bg: "#f3e5f5", color: "#6a1b9a" },
  Cancelled:  { bg: "#ffebee", color: "#c62828" },
};

const statusBgCalendar = {
  Pending:    "#ffe0b2",
  Approved:   "#c8e6c9",
  CheckedIn:  "#bbdefb",
  CheckedOut: "#e1bee7",
  Cancelled:  "#ffcdd2",
};

const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 36;
const ROOM_COL_WIDTH = 130;
const DAY_COL_WIDTH = 38;

function CalendarView({ bookings, rooms }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getBookingForCell = (roomNumber, day) => {
    const cellDate = new Date(year, month, day);
    return bookings.find(b => {
      if (b.room?.roomNumber !== roomNumber) return false;
      if (b.status === "Cancelled") return false;
      const checkIn = new Date(b.checkInDate);
      const checkOut = new Date(b.checkOutDate);
      return cellDate >= checkIn && cellDate < checkOut;
    });
  };

  const isToday = (day) =>
    new Date(year, month, day).toDateString() === today.toDateString();

  return (
    <Box sx={{ width: "100%" }}>
      {/* Month Navigation */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Button onClick={prevMonth} variant="outlined" size="small">‹ Prev</Button>
        <Typography variant="h6" fontWeight="600">{monthName}</Typography>
        <Button onClick={nextMonth} variant="outlined" size="small">Next ›</Button>
      </Box>

      {/*
        Two-panel layout:
        - Left panel: room names, fixed width, NO overflow, NO sticky
        - Right panel: day columns, scrolls horizontally, clipped to its own box
        Key: both panels wrapped in a single flex row with overflow:hidden on the outer box
      */}
      <Box sx={{
        display: "flex",
        width: "100%",
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        overflow: "hidden",  // clips BOTH panels — nothing can bleed outside
      }}>

        {/* LEFT panel — room names, never scrolls */}
        <Box sx={{
          width: ROOM_COL_WIDTH,
          minWidth: ROOM_COL_WIDTH,
          flexShrink: 0,
          borderRight: "2px solid #ccc",
          backgroundColor: "#fff",
        }}>
          {/* Header */}
          <Box sx={{
            height: HEADER_HEIGHT,
            backgroundColor: "#1a1a2e",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            px: 1.5,
            fontWeight: 600,
            fontSize: 13,
          }}>
            Room
          </Box>
          {/* Rows */}
          {rooms.map((room, i) => (
            <Box key={room.roomId} sx={{
              height: ROW_HEIGHT,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: 1.5,
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#fff",
            }}>
              <Typography fontSize={13} fontWeight={600} lineHeight={1.3}>
                Room {room.roomNumber}
              </Typography>
              <Typography fontSize={11} color="text.secondary" lineHeight={1.2}>
                {room.roomType}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* RIGHT panel — scrollable day grid, clipped inside this box */}
        <Box sx={{
          flex: 1,
          overflowX: "auto",
          overflowY: "hidden",
        }}>
          {/* Day header */}
          <Box sx={{ display: "flex", height: HEADER_HEIGHT }}>
            {days.map(day => (
              <Box key={day} sx={{
                minWidth: DAY_COL_WIDTH,
                width: DAY_COL_WIDTH,
                height: HEADER_HEIGHT,
                backgroundColor: isToday(day) ? "#1a1a2e" : "#f5f5f5",
                color: isToday(day) ? "#fff" : "#555",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: isToday(day) ? 700 : 500,
                fontSize: 12,
                borderLeft: "1px solid #e0e0e0",
                flexShrink: 0,
              }}>
                {day}
              </Box>
            ))}
          </Box>

          {/* Room rows */}
          {rooms.map((room) => (
            <Box key={room.roomId} sx={{
              display: "flex",
              height: ROW_HEIGHT,
              borderTop: "1px solid #e0e0e0",
            }}>
              {days.map(day => {
                const booking = getBookingForCell(room.roomNumber, day);
                const isCheckIn = booking &&
                  new Date(booking.checkInDate).getDate() === day &&
                  new Date(booking.checkInDate).getMonth() === month;

                return (
                  <Box
                    key={day}
                    title={booking ? `${booking.user?.fullName} — ${booking.status}` : ""}
                    sx={{
                      minWidth: DAY_COL_WIDTH,
                      width: DAY_COL_WIDTH,
                      height: ROW_HEIGHT,
                      flexShrink: 0,
                      backgroundColor: booking
                        ? (statusBgCalendar[booking.status] || "#e0e0e0")
                        : "#fff",
                      borderLeft: "1px solid #e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: booking ? "pointer" : "default",
                      overflow: "hidden",
                    }}
                  >
                    {isCheckIn && booking && (
                      <Typography sx={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#333",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        px: 0.3,
                        maxWidth: DAY_COL_WIDTH - 4,
                      }}>
                        {booking.user?.fullName?.split(" ")[0]}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
        {Object.entries(statusBgCalendar).map(([status, color]) => (
          <Box key={status} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 14, height: 14, backgroundColor: color, borderRadius: 1, border: "1px solid #ccc" }} />
            <Typography variant="caption">{status}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [tab, setTab] = useState(0);
  const [view, setView] = useState("list");
  const [newBooking, setNewBooking] = useState({
    roomType: "Single",
    checkInDate: "",
    checkOutDate: "",
  });

  const canAdd = [1, 2, 4, 5].includes(user?.roleId);

  useEffect(() => {
    fetchBookings();
    fetchRooms();
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

  const fetchRooms = async () => {
    try {
      const res = await getRoomsAPI();
      setRooms(res.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
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
    if (tab === 0) return true;
    if (tab === 1) return ["Pending", "Approved", "CheckedIn"].includes(b.status);
    if (tab === 2) return ["CheckedOut", "Cancelled"].includes(b.status);
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(e, v) => v && setView(v)}
          size="small"
        >
          <ToggleButton value="list">
            <ViewListIcon sx={{ mr: 0.5 }} fontSize="small" /> List
          </ToggleButton>
          <ToggleButton value="calendar">
            <CalendarMonthIcon sx={{ mr: 0.5 }} fontSize="small" /> Calendar
          </ToggleButton>
        </ToggleButtonGroup>

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

      <Card sx={{
        borderRadius: 3,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        overflow: "hidden",   // hard clip — nothing inside can bleed outside the card
        width: "100%",
      }}>
        {view === "list" && (
          <Box sx={{ borderBottom: "1px solid #e0e0e0", px: 2 }}>
            <Tabs value={tab} onChange={(e, v) => setTab(v)}>
              <Tab label={`All (${bookings.length})`} />
              <Tab label={`Active (${bookings.filter(b => ["Pending","Approved","CheckedIn"].includes(b.status)).length})`} />
              <Tab label={`Completed (${bookings.filter(b => ["CheckedOut","Cancelled"].includes(b.status)).length})`} />
            </Tabs>
          </Box>
        )}

        <CardContent sx={{ width: "100%", boxSizing: "border-box" }}>
          {view === "list" ? (
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
          ) : (
            <CalendarView bookings={bookings} rooms={rooms} />
          )}
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