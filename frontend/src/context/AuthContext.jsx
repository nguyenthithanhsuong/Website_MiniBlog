import { useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./AuthContextObject";

// Helper function to decode JWT payload on the client side
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      const decoded = parseJwt(savedToken);
      if (decoded) {
        return { 
          loggedIn: true, 
          userId: decoded.userId, 
          username: decoded.username, 
          role: decoded.role 
        };
      }
    }
    return null;
  });
  const [loading] = useState(false); // No need for initial loading if we sync state directly

  const login = async (username, password) => {
    try {
      const res = await api.post("/auth/login", { username, password });
      const newToken = res.data.token;
      
      localStorage.setItem("token", newToken);
      setToken(newToken);

      const decoded = parseJwt(newToken);
      setUser({ 
        loggedIn: true, 
        userId: decoded?.userId, 
        username: decoded?.username, 
        role: decoded?.role 
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed" 
      };
    }
  };

  const register = async (username, password) => {
    try {
      await api.post("/auth/register", { username, password });
      return { success: true };
    } catch (error) {
       return { 
        success: false, 
        message: error.response?.data?.message || "Register failed" 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
