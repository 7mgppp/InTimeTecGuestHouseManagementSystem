import { createContext, useContext, useState } from "react";
import { loginAPI } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password, roleId, employeeId = null) => {
    try {
      const response = await loginAPI({
        email,
        password,
        employeeId: roleId === 5 ? null : employeeId,
      });

      const data = response.data;

      localStorage.setItem("token", data.token);

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
      const message = error.response?.data || "Invalid credentials";
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);