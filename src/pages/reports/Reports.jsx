import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, TextField, FormControl,
  InputLabel, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, CircularProgress,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import MainLayout from "../../components/layout/MainLayout";
import { getBookingsByEmployeeAPI, getBookingsByRoomAPI, getMonthlyBookingsAPI } from "../../api/api";

function Reports() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterRoom, setFilterRoom] = useState("");

  useEffect(() => {
    fetchMonthly();
  }, []);

  const fetchMonthly = async () => {
    try {
      const res = await getMonthlyBookingsAPI();
      setBookings(res.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      if (filterEmployee) {
        const res = await getBookingsByEmployeeAPI(filterEmployee);
        setBookings(res.data);
      } else if (filterRoom) {
        const res = await getBookingsByRoomAPI(filterRoom);
        setBookings(res.data);
      } else {
        fetchMonthly();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFilterEmployee("");
    setFilterRoom("");
    fetchMonthly();
  };

  return (
    <MainLayout>
      {/* Filters */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)", mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" mb={2}>
            <FilterAltIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Filter Reports
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              label="Filter by Employee ID"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              size="small"
              sx={{ minWidth: 220 }}
            />
            <TextField
              label="Filter by Room Number"
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              size="small"
              sx={{ minWidth: 220 }}
            />
            <Button variant="contained" onClick={handleFilter} sx={{ backgroundColor: "#1a1a2e" }}>
              Apply
            </Button>
            <Button variant="outlined" onClick={handleClear}>
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" mb={2}>
            Monthly Allocation Report
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell><b>#</b></TableCell>
                    <TableCell><b>Guest Name</b></TableCell>
                    <TableCell><b>Employee ID</b></TableCell>
                    <TableCell><b>Room</b></TableCell>
                    <TableCell><b>Check In</b></TableCell>
                    <TableCell><b>Check Out</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
                      <TableRow key={booking.bookingId} hover>
                        <TableCell>{booking.bookingId}</TableCell>
                        <TableCell>{booking.user?.fullName}</TableCell>
                        <TableCell>{booking.user?.employeeId || "—"}</TableCell>
                        <TableCell>Room {booking.room?.roomNumber}</TableCell>
                        <TableCell>{booking.checkInDate?.split("T")[0]}</TableCell>
                        <TableCell>{booking.checkOutDate?.split("T")[0]}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "inline-block",
                              backgroundColor: booking.status === "Approved" ? "#e8f5e9" : "#fff3e0",
                              color: booking.status === "Approved" ? "#2e7d32" : "#e65100",
                              px: 1.5, py: 0.3, borderRadius: 5, fontSize: 12, fontWeight: 600,
                            }}
                          >
                            {booking.status?.toUpperCase()}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

export default Reports;