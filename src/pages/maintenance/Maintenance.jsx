import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Tabs, Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { getMaintenanceAPI, createMaintenanceAPI, completeMaintenanceAPI, getRoomsAPI } from "../../api/api";

function Maintenance() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [tab, setTab] = useState(0);
  const [newRequest, setNewRequest] = useState({ roomId: "", reason: "" });

  const canAdd = [1, 2, 3, 4].includes(user?.roleId);
  const canComplete = [1, 2].includes(user?.roleId);

  useEffect(() => {
    fetchMaintenance();
    fetchRooms();
  }, []);

  const fetchMaintenance = async () => {
    try {
      const res = await getMaintenanceAPI();
      setRequests(res.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await getRoomsAPI();
      setRooms(res.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCreate = async () => {
    if (!newRequest.roomId || !newRequest.reason) return;
    try {
      await createMaintenanceAPI({
        roomId: newRequest.roomId,
        reportedByUserId: user?.userId,
        reason: newRequest.reason,
      });
      setOpenAdd(false);
      setNewRequest({ roomId: "", reason: "" });
      fetchMaintenance();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeMaintenanceAPI(id);
      fetchMaintenance();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (tab === 0) return true;
    if (tab === 1) return r.status === "Open";
    if (tab === 2) return r.status === "Completed";
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
            onClick={() => setOpenAdd(true)}
            sx={{ backgroundColor: "#1a1a2e" }}
          >
            Report Maintenance
          </Button>
        )}
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <Box sx={{ borderBottom: "1px solid #e0e0e0", px: 2 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label={`All (${requests.length})`} />
            <Tab label={`Open (${requests.filter(r => r.status === "Open").length})`} />
            <Tab label={`Completed (${requests.filter(r => r.status === "Completed").length})`} />
          </Tabs>
        </Box>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><b>#</b></TableCell>
                  <TableCell><b>Room</b></TableCell>
                  <TableCell><b>Reported By</b></TableCell>
                  <TableCell><b>Reason</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell><b>Date</b></TableCell>
                  <TableCell><b>Action</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No maintenance requests
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => (
                    <TableRow key={req.maintenanceId} hover>
                      <TableCell>{req.maintenanceId}</TableCell>
                      <TableCell>Room {req.roomNumber}</TableCell>
                      <TableCell>{req.reportedBy}</TableCell>
                      <TableCell>{req.reason}</TableCell>
                      <TableCell>
                        <Box sx={{
                          display: "inline-block",
                          backgroundColor: req.status === "Completed" ? "#e8f5e9" : "#fff3e0",
                          color: req.status === "Completed" ? "#2e7d32" : "#e65100",
                          px: 1.5, py: 0.3, borderRadius: 5, fontSize: 12, fontWeight: 600,
                        }}>
                          {req.status?.toUpperCase()}
                        </Box>
                      </TableCell>
                      <TableCell>{req.createdAt?.split("T")[0]}</TableCell>
                      <TableCell>
                        {req.status === "Open" && canComplete && (
                          <Button size="small" variant="outlined" color="success"
                            onClick={() => handleComplete(req.maintenanceId)}>
                            Complete
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

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold">Report Maintenance</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Room</InputLabel>
            <Select
              value={newRequest.roomId}
              label="Room"
              onChange={(e) => setNewRequest({ ...newRequest, roomId: e.target.value })}
            >
              {rooms.map((room) => (
                <MenuItem key={room.roomId} value={room.roomId}>
                  Room {room.roomNumber} — {room.roomType}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth multiline rows={3}
            label="Reason"
            value={newRequest.reason}
            onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ backgroundColor: "#1a1a2e" }}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

export default Maintenance;