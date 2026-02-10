import axios from "axios";

/**
 * API Utility Configuration
 * Centralized Axios instance with interceptors for JWT injection
 * and global error handling for the Matale Premium Jewellery system.
 */
const API = axios.create({
  baseURL: "http://localhost:5001/api", 
  withCredentials: false, // Set to true if using cookies, false for Bearer tokens
});

// Request Interceptor: Attach JWT token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor: Global Error Handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
    // Specific check for backend availability
    if (err.message === "Network Error" || err.code === "ERR_NETWORK") {
      console.error("🚨 Backend Server Unreachable! Please ensure the server is running on port 5001.");
    }

    // Handle Session Expiration (401 Unauthorized)
    if (err?.response?.status === 401) {
      const authRoutes = ["auth/login", "auth/verify-otp"];
      const isAuthAttempt = authRoutes.includes(err.config.url);

      if (!isAuthAttempt) {
        console.warn("Unauthorized request detected. Session may have expired.");
        // Optional: Clear local storage and redirect to login
        // localStorage.removeItem("token");
        // window.location.href = "/login";
      }
    }
    
    return Promise.reject(err);
  }
);

export default API;