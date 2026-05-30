import { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const roles = [
  { roleId: 1, roleName: "Admin" },
  { roleId: 2, roleName: "Management" },
  { roleId: 3, roleName: "Security" },
  { roleId: 4, roleName: "Staff" },
  { roleId: 5, roleName: "Guest" },
];

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isGuest = selectedRoleId === 5;

  const handleLogin = async () => {
    if (!selectedRoleId || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (!isGuest && !employeeId) {
      setError("Please enter your Employee ID");
      return;
    }

    setLoading(true);
    setError("");

    const result = await login(email, password, selectedRoleId, employeeId);

    setLoading(false);

    if (result.success) {
      if (result.roleId === 5) navigate("/guest/bookings");
      else navigate("/dashboard");
    } else {
      setError(typeof result.message === "string" ? result.message : "Invalid credentials");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: 3,
            padding: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h5" fontWeight="bold" textAlign="center" mb={1}>
            🏨 Guest House
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary" mb={3}>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Role</InputLabel>
            <Select
              value={selectedRoleId}
              label="Select Role"
              onChange={(e) => {
                setSelectedRoleId(e.target.value);
                setError("");
                setEmployeeId("");
              }}
            >
              {roles.map((role) => (
                <MenuItem key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedRoleId && !isGuest && (
            <TextField
              fullWidth
              label="Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={loading}
            sx={{ mt: 1, backgroundColor: "#1a1a2e" }}
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;