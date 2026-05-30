import { useState, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { getRoomsAPI, addRoomAPI, markMaintenanceAPI, markAvailableAPI, updateRoomAPI } from "../../api/api";

const statusColor = {
  Available: { bg: "#e8f5e9", color: "#2e7d32", label: "Available" },
  Occupied: { bg: "#e3f2fd", color: "#1565c0", label: "Occupied" },
  Maintenance: { bg: "#fff3e0", color: "#e65100", label: "Maintenance" },
};

function Rooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [newRoom, setNewRoom] = useState({ roomNumber: "", roomType: "Single", capacity: 1, status: "Available" });

  const canAdd = [1, 2].includes(user?.roleId);
  const canChangeStatus = [1, 2, 3].includes(user?.roleId);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await getRoomsAPI();
      setRooms(res.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      if (newStatus === "Maintenance") {
        await markMaintenanceAPI(roomId);
      } else if (newStatus === "Available") {
        await markAvailableAPI(roomId);
      } else {
        await updateRoomAPI(roomId, {
          ...rooms.find(r => r.roomId === roomId),
          status: newStatus,
        });
      }
      fetchRooms();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAddRoom = async () => {
    if (!newRoom.roomNumber) return;
    try {
      await addRoomAPI(newRoom);
      setOpenAdd(false);
      setNewRoom({ roomNumber: "", roomType: "Single", capacity: 1, status: "Available" });
      fetchRooms();
    } catch (error) {
      console.error("Error adding room:", error);
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
            Add Room
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room.roomId}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                borderTop: `4px solid ${statusColor[room.status]?.color || "#ccc"}`,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <MeetingRoomIcon sx={{ color: "#1a1a2e" }} />
                    <Typography variant="h6" fontWeight="bold">
                      Room {room.roomNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ backgroundColor: "#e8eaf6", color: "#1a1a2e", px: 1.5, py: 0.3, borderRadius: 5, fontSize: 11, fontWeight: 600 }}>
                    {room.roomType?.toUpperCase()}
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  Capacity: {room.capacity}
                </Typography>

                <Box
                  sx={{
                    display: "inline-block",
                    backgroundColor: statusColor[room.status]?.bg || "#f5f5f5",
                    color: statusColor[room.status]?.color || "#333",
                    px: 2, py: 0.5, borderRadius: 5, fontSize: 12, fontWeight: 600, mb: 2,
                  }}
                >
                  {statusColor[room.status]?.label || room.status}
                </Box>

                {canChangeStatus && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Change Status</InputLabel>
                    <Select
                      value={room.status}
                      label="Change Status"
                      onChange={(e) => handleStatusChange(room.roomId, e.target.value)}
                    >
                      <MenuItem value="Available">Available</MenuItem>
                      <MenuItem value="Occupied">Occupied</MenuItem>
                      <MenuItem value="Maintenance">Maintenance</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold">Add New Room</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Room Number"
            value={newRoom.roomNumber}
            onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth label="Capacity" type="number"
            value={newRoom.capacity}
            onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Room Type</InputLabel>
            <Select
              value={newRoom.roomType} label="Room Type"
              onChange={(e) => setNewRoom({ ...newRoom, roomType: e.target.value })}
            >
              <MenuItem value="Single">Single</MenuItem>
              <MenuItem value="Double">Double</MenuItem>
              <MenuItem value="Suite">Suite</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRoom} sx={{ backgroundColor: "#1a1a2e" }}>
            Add Room
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

export default Rooms;