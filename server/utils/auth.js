// Get JWT token from localStorage
export const getToken = () => {
  return localStorage.getItem("token");
};

// Decode JWT payload safely
export const decodeToken = (token) => {
  try {
    if (!token) return null;

    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(payload);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

// Get user role from JWT
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.role ?? null;
};

// Get user ID from JWT (optional but useful)
export const getUserId = () => {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.id ?? null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Logout helper
export const logout = () => {
  localStorage.removeItem("token");
};
