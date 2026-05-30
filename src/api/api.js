import axios from "axios";

const BASE_URL = "https://guesthouse-api-gpq2.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── AUTH ───────────────────────────────
export const loginAPI = (data) => api.post("/api/auth/login", data);
export const registerAPI = (data) => api.post("/api/auth/register", data);

// ─── ROOMS ──────────────────────────────
export const getRoomsAPI = () => api.get("/api/room");
export const getAvailableRoomsAPI = () => api.get("/api/room/available");
export const addRoomAPI = (data) => api.post("/api/room", data);
export const updateRoomAPI = (id, data) => api.put(`/api/room/${id}`, data);
export const markMaintenanceAPI = (id) => api.put(`/api/room/maintenance/${id}`);
export const markAvailableAPI = (id) => api.put(`/api/room/available/${id}`);
export const deleteRoomAPI = (id) => api.delete(`/api/room/${id}`);

// ─── BOOKINGS ───────────────────────────
export const getBookingsAPI = () => api.get("/api/booking");
export const createBookingAPI = (data) => api.post("/api/booking", data);
export const approveBookingAPI = (id) => api.put(`/api/booking/approve/${id}`);
export const checkInAPI = (id) => api.put(`/api/booking/checkin/${id}`);
export const checkOutAPI = (id) => api.put(`/api/booking/checkout/${id}`);
export const cancelBookingAPI = (id) => api.put(`/api/booking/cancel/${id}`);
export const deleteBookingAPI = (id) => api.delete(`/api/booking/${id}`);

// ─── DASHBOARD ──────────────────────────
export const getDashboardSummaryAPI = () => api.get("/api/dashboard/summary");
export const getMonthlyBookingsAPI = () => api.get("/api/dashboard/monthly-bookings");
export const getBookingsByEmployeeAPI = (employeeId) => api.get(`/api/dashboard/employee/${employeeId}`);
export const getBookingsByRoomAPI = (roomNumber) => api.get(`/api/dashboard/room/${roomNumber}`);

// ─── MAINTENANCE ────────────────────────
export const getMaintenanceAPI = () => api.get("/api/maintenance");
export const createMaintenanceAPI = (data) => api.post("/api/maintenance", data);
export const completeMaintenanceAPI = (id) => api.put(`/api/maintenance/complete/${id}`);
export const deleteMaintenanceAPI = (id) => api.delete(`/api/maintenance/${id}`);

export default api;