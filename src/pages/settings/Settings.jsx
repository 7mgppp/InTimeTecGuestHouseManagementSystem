import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
} from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";

const roleColors = {
  Admin:      { bg: "#e8eaf6", color: "#1a1a2e" },
  Management: { bg: "#e3f2fd", color: "#1565c0" },
  Security:   { bg: "#fff3e0", color: "#e65100" },
  Staff:      { bg: "#e8f5e9", color: "#2e7d32" },
  Guest:      { bg: "#fce4ec", color: "#c62828" },
};

const USERS = [
  { userId: 3,  fullName: "Test User",    email: "test@test.com",              employeeId: "EMP001", phoneNumber: "9999999999", role: "Guest" },
  { userId: 4,  fullName: "Admin User",   email: "admin@guesthouse.com",       employeeId: "EMP001", phoneNumber: "9876543210", role: "Admin" },
  { userId: 5,  fullName: "Arjun Sharma", email: "arjun.sharma@email.com",     employeeId: "GST001", phoneNumber: "9876543201", role: "Guest" },
  { userId: 6,  fullName: "Priya Patel",  email: "priya.patel@email.com",      employeeId: "GST002", phoneNumber: "9876543202", role: "Guest" },
  { userId: 7,  fullName: "Rahul Mehta",  email: "rahul.mehta@email.com",      employeeId: "GST003", phoneNumber: "9876543203", role: "Guest" },
  { userId: 8,  fullName: "Sneha Joshi",  email: "sneha.joshi@email.com",      employeeId: "GST004", phoneNumber: "9876543204", role: "Guest" },
  { userId: 9,  fullName: "Vikram Singh", email: "vikram.singh@email.com",     employeeId: "GST005", phoneNumber: "9876543205", role: "Guest" },
  { userId: 10, fullName: "Ananya Gupta", email: "ananya.gupta@email.com",     employeeId: "GST006", phoneNumber: "9876543206", role: "Guest" },
];

function Settings() {
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
                {USERS.map((user) => (
                  <TableRow key={user.userId} hover>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.employeeId || "—"}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>
                      <Box sx={{
                        display: "inline-block",
                        backgroundColor: roleColors[user.role]?.bg || "#f5f5f5",
                        color: roleColors[user.role]?.color || "#333",
                        px: 1.5, py: 0.3, borderRadius: 5, fontSize: 12, fontWeight: 600,
                      }}>
                        {user.role}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

export default Settings;