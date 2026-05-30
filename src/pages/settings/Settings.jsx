import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
} from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../api/api";

const roleColors = {
  Admin: { bg: "#e8eaf6", color: "#1a1a2e" },
  Management: { bg: "#e3f2fd", color: "#1565c0" },
  Security: { bg: "#fff3e0", color: "#e65100" },
  Staff: { bg: "#e8f5e9", color: "#2e7d32" },
  Guest: { bg: "#fce4ec", color: "#c62828" },
};

function Settings() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/user");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
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
          <Typography variant="h6" fontWeight="600" mb={2}>
            User & Role Management
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><b>#</b></TableCell>
                  <TableCell><b>Full Name</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Employee ID</b></TableCell>
                  <TableCell><b>Phone</b></TableCell>
                  <TableCell><b>Role</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.userId} hover>
                      <TableCell>{user.userId}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.employeeId || "—"}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "inline-block",
                            backgroundColor: roleColors[user.role?.roleName]?.bg || "#f5f5f5",
                            color: roleColors[user.role?.roleName]?.color || "#333",
                            px: 1.5, py: 0.3, borderRadius: 5, fontSize: 12, fontWeight: 600,
                          }}
                        >
                          {user.role?.roleName || "—"}
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
    </MainLayout>
  );
}

export default Settings;