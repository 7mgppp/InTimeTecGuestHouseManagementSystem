import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, FormControl,
  InputLabel, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, CircularProgress,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import MainLayout from "../../components/layout/MainLayout";
import { getBookingsByEmployeeAPI, getBookingsByRoomAPI, getMonthlyBookingsAPI } from "../../api/api";

const STATUS_COLORS = {
  APPROVED:   { bg: "#e8f5e9", color: "#2e7d32" },
  CHECKEDIN:  { bg: "#e3f2fd", color: "#1565c0" },
  CHECKEDOUT: { bg: "#fff3e0", color: "#e65100" },
  CANCELLED:  { bg: "#fce4ec", color: "#c62828" },
};

function SortIcon({ column, sortCol, sortDir }) {
  if (sortCol !== column) return <UnfoldMoreIcon sx={{ fontSize: 16, opacity: 0.4, verticalAlign: "middle", ml: 0.5 }} />;
  return sortDir === "asc"
    ? <ArrowUpwardIcon sx={{ fontSize: 16, verticalAlign: "middle", ml: 0.5 }} />
    : <ArrowDownwardIcon sx={{ fontSize: 16, verticalAlign: "middle", ml: 0.5 }} />;
}

function Reports() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterRoom, setFilterRoom] = useState("");

  // Sort
  const [sortCol, setSortCol] = useState("bookingId");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    fetchMonthly();
  }, []);

  const fetchMonthly = async () => {
    setLoading(true);
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
        return;
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

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  // Unique dropdown options from data
  const employeeOptions = ["", ...new Set(bookings.map(b => b.user?.employeeId).filter(Boolean).sort())];
  const roomOptions     = ["", ...new Set(bookings.map(b => b.room?.roomNumber).filter(Boolean).sort())];

  // Sort
  const sorted = [...bookings].sort((a, b) => {
    let aVal, bVal;
    if (sortCol === "bookingId")   { aVal = a.bookingId;                  bVal = b.bookingId; }
    if (sortCol === "guestName")   { aVal = a.user?.fullName || "";        bVal = b.user?.fullName || ""; }
    if (sortCol === "employeeId")  { aVal = a.user?.employeeId || "";      bVal = b.user?.employeeId || ""; }
    if (sortCol === "room")        { aVal = a.room?.roomNumber || "";      bVal = b.room?.roomNumber || ""; }
    if (sortCol === "checkIn")     { aVal = a.checkInDate || "";           bVal = b.checkInDate || ""; }
    if (sortCol === "checkOut")    { aVal = a.checkOutDate || "";          bVal = b.checkOutDate || ""; }
    if (sortCol === "status")      { aVal = a.status || "";                bVal = b.status || ""; }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const thStyle = {
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    "&:hover": { backgroundColor: "#ebebeb" },
  };

  return (
    <MainLayout>
      {/* Filter Card */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)", mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" mb={2}>
            <FilterAltIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Filter Reports
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Employee ID</InputLabel>
              <Select value={filterEmployee} label="Employee ID" onChange={e => setFilterEmployee(e.target.value)}>
                <MenuItem value="">All Employees</MenuItem>
                {employeeOptions.filter(Boolean).map(id => (
                  <MenuItem key={id} value={id}>{id}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Room</InputLabel>
              <Select value={filterRoom} label="Room" onChange={e => setFilterRoom(e.target.value)}>
                <MenuItem value="">All Rooms</MenuItem>
                {roomOptions.filter(Boolean).map(r => (
                  <MenuItem key={r} value={r}>Room {r}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="contained" onClick={handleFilter} sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#16213e" } }}>
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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="600">
              Monthly Allocation Report
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {sorted.length} record{sorted.length !== 1 ? "s" : ""}
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    {[
                      { label: "#",           col: "bookingId"  },
                      { label: "Guest Name",  col: "guestName"  },
                      { label: "Employee ID", col: "employeeId" },
                      { label: "Room",        col: "room"       },
                      { label: "Check In",    col: "checkIn"    },
                      { label: "Check Out",   col: "checkOut"   },
                      { label: "Status",      col: "status"     },
                    ].map(({ label, col }) => (
                      <TableCell key={col} sx={thStyle} onClick={() => handleSort(col)}>
                        <b>{label}</b>
                        <SortIcon column={col} sortCol={sortCol} sortDir={sortDir} />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sorted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sorted.map((booking) => {
                      const statusKey = booking.status?.toUpperCase();
                      const statusStyle = STATUS_COLORS[statusKey] || { bg: "#f5f5f5", color: "#333" };
                      return (
                        <TableRow key={booking.bookingId} hover>
                          <TableCell>{booking.bookingId}</TableCell>
                          <TableCell>{booking.user?.fullName}</TableCell>
                          <TableCell>{booking.user?.employeeId || "—"}</TableCell>
                          <TableCell>Room {booking.room?.roomNumber}</TableCell>
                          <TableCell>{booking.checkInDate?.split("T")[0]}</TableCell>
                          <TableCell>{booking.checkOutDate?.split("T")[0]}</TableCell>
                          <TableCell>
                            <Box sx={{
                              display: "inline-block",
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                              px: 1.5, py: 0.3, borderRadius: 5, fontSize: 12, fontWeight: 600,
                            }}>
                              {statusKey}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
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