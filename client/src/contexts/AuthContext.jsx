import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in when app starts
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend
        // NOTE: Ensure your backend has this route, or change to '/users/me'
        const res = await API.get("/auth/me");
        
        if (res.data.success) {
          setUser(res.data.data || res.data.user);
          setIsAuthenticated(true);
        } else {
          // Token invalid
          handleLogout();
        }
      } catch (err) {
        console.error("Auth check failed:", err.message);
        handleLogout(); // Clear invalid token
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      
      // Login now returns userId and requires OTP verification
      if (res.data.userId) {
        // Store userId for OTP step
        localStorage.setItem("userId", res.data.userId);
        localStorage.setItem("userEmail", email);
        return { success: true, requiresOtp: true };
      }
      
      return { success: false, error: res.data.message };
    } catch (err) {
      console.error("Login error:", err);
      return { 
        success: false, 
        error: err.response?.data?.message || "Login failed. Please check server." 
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await API.post("/auth/register", userData);
      if (res.data.success || res.data.token) {
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        setUser(user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: res.data.message };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || "Registration failed" 
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    localStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);
  };

  const completeOtpVerification = async (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout: handleLogout,
    completeOtpVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}