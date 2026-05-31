import { createContext, useContext, useState } from "react";
import { loginAPI } from "../api/api";

const AuthContext = createContext();

const parseToken = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const loadUserFromStorage = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const payload = parseToken(token);
  if (!payload) return null;
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    localStorage.removeItem("token");
    return null;
  }

  const nameId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  const email = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
  const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  const roleMap = { Admin: 1, Management: 2, Security: 3, Staff: 4, Guest: 5 };

  return {
    userId: parseInt(nameId),
    fullName: localStorage.getItem("fullName") || email?.split("@")[0],
    email,
    role,
    roleId: roleMap[role] || 1,
    employeeId: localStorage.getItem("employeeId"),
    phoneNumber: localStorage.getItem("phoneNumber"),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadUserFromStorage);

  const login = async (email, password, roleId, employeeId = null) => {
    try {
      const response = await Promise.race([
        loginAPI({ email, password, employeeId: roleId === 5 ? null : employeeId }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 30000)),
      ]);

      const data = response.data;
      localStorage.setItem("token", data.token);
      // Save extra fields so they survive refresh
      localStorage.setItem("fullName", data.fullName || "");
      localStorage.setItem("employeeId", data.employeeId || "");
      localStorage.setItem("phoneNumber", data.phoneNumber || "");

      const loggedInUser = {
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        employeeId: data.employeeId,
        role: data.role,
        roleId: roleId,
      };

      setUser(loggedInUser);
      return { success: true, roleId };

    } catch (error) {
      const message = error.message === "timeout"
        ? "Server is waking up, please try again in 30 seconds"
        : error.response?.data || "Invalid credentials";
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("phoneNumber");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);