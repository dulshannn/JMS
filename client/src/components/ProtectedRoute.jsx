import React from "react";
import { Navigate } from "react-router-dom";
import { getUserRole } from "../utils/auth.js";

export default function ProtectedRoute({ children, allowedRoles, role }) {
  const userRole = getUserRole();

  // not logged in
  if (!userRole) return <Navigate to="/login" replace />;

  // Check for allowedRoles (new format) or role (old format for backward compatibility)
  const permittedRoles = allowedRoles || (role ? [role] : null);
  
  // role mismatch
  if (permittedRoles && !permittedRoles.includes(userRole)) {
    return <Navigate to={userRole === "admin" ? "/admin-dashboard" : "/customer-dashboard"} replace />;
  }

  return children;
}