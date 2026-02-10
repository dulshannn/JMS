import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";

// Public Pages
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Otp from "./pages/Otp.jsx";

// Dashboards
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import SupplierDashboard from "./pages/SupplierDashboard.jsx"; 
import ManagerDashboard from "./pages/ManagerDashboard.jsx"; // ✅ NEW IMPORT

// AI & Design
import AIStudio from "./pages/AIStudio.jsx";
import CustomOrderForm from "./pages/CustomOrderForm.jsx";
import ManagerOrders from "./pages/ManagerOrders.jsx";
import OrderTracking from "./pages/OrderTracking.jsx";

// Customers
import Customers from "./pages/Customer.jsx";
import CustomerForm from "./pages/CustomerForm.jsx";

// Suppliers
import Suppliers from "./pages/Suppliers.jsx";
import SupplierForm from "./pages/SupplierForm.jsx";

// Deliveries
import Deliveries from "./pages/Deliveries.jsx";
import DeliveryForm from "./pages/DeliveryForm.jsx";
import DeliveryEdit from "./pages/DeliveryEdit.jsx";

// Stock & Inventory
import Stock from "./pages/Stock.jsx";
import StockLogs from "./pages/StockLogs.jsx";
import Jewellery from "./pages/Jewellery.jsx";

// Security
import LockerVerification from "./pages/LockerVerification.jsx";

// Users & Profile
import Users from "./pages/Users.jsx";
import Profile from "./pages/Profile.jsx";

// Error Pages
import NotFound from "./pages/NotFound.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

// Components
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#111',
              color: '#d4af37',
              border: '1px solid #333'
            },
          }}
        />
        
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<Otp />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ========== CUSTOMER ROUTES ========== */}
          <Route
            path="/customer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* ========== SUPPLIER ROUTES ========== */}
          <Route
            path="/supplier-dashboard"
            element={
              <ProtectedRoute allowedRoles={["supplier", "admin"]}>
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />

          {/* ========== MANAGER ROUTES (NEW) ========== */}
          <Route
            path="/manager-dashboard"
            element={
              <ProtectedRoute allowedRoles={["manager", "admin"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* ========== SHARED ROUTES (Manager Added) ========== */}
          
          {/* Stock: Admin, Supplier, Manager */}
          <Route
            path="/stock"
            element={
              <ProtectedRoute allowedRoles={["admin", "supplier", "manager"]}>
                <Stock />
              </ProtectedRoute>
            }
          />

          {/* Deliveries: Admin, Supplier */}
          <Route
             path="/deliveries"
             element={
               <ProtectedRoute allowedRoles={["admin", "supplier"]}>
                 <Deliveries />
               </ProtectedRoute>
             }
           />

          {/* AI Design Studio: Customer, Admin */}
          <Route
            path="/ai-studio"
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <AIStudio />
              </ProtectedRoute>
            }
          />

          {/* Orders: Customer, Admin */}
          <Route
            path="/orders/new"
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <CustomOrderForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/track"
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <OrderTracking />
              </ProtectedRoute>
            }
          />

          {/* ========== ADMIN & MANAGER SHARED ========== */}
          
          {/* Order Management: Admin, Manager */}
          <Route
            path="/orders/manager"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <ManagerOrders />
              </ProtectedRoute>
            }
          />
          
          {/* User Management: Admin, Manager (View Staff) */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* Jewellery: Admin, Manager */}
          <Route
            path="/jewellery"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Jewellery />
              </ProtectedRoute>
            }
          />

          {/* ========== ADMIN ONLY ========== */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Customer Management */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CustomerForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CustomerForm />
              </ProtectedRoute>
            }
          />

          {/* Supplier Management */}
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Suppliers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SupplierForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SupplierForm />
              </ProtectedRoute>
            }
          />

          {/* Delivery Management (Admin controls) */}
          <Route
            path="/deliveries/new"
            element={
              <ProtectedRoute allowedRoles={["admin", "supplier"]}>
                <DeliveryForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deliveries/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DeliveryEdit />
              </ProtectedRoute>
            }
          />

          {/* Inventory Logs */}
          <Route
            path="/stock-logs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StockLogs />
              </ProtectedRoute>
            }
          />

          {/* Security & Verification */}
          <Route
            path="/locker-verification"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <LockerVerification />
              </ProtectedRoute>
            }
          />

          {/* Profile: All Roles */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["customer", "admin", "supplier", "manager"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* ========== ERROR ROUTES ========== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}