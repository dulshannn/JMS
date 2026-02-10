import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [approvedOrders, setApprovedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    lowStockItems: 5,
    completedDeliveries: 128,
    revenue: 450000
  });

  useEffect(() => {
    // 1. Fetch User Data
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }

    // 2. Fetch Approved Orders
    fetchApprovedOrders();
  }, [navigate]);

  const fetchApprovedOrders = async () => {
    try {
      const res = await API.get("/orders?status=processing");
      const orders = Array.isArray(res.data) ? res.data : [];
      setApprovedOrders(orders);
      
      // Update stats with real data
      setStats(prev => ({
        ...prev,
        pendingOrders: orders.length
      }));
    } catch (error) {
      console.error("Failed to fetch approved orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#d4af37] selection:text-black">
      {/* --- Sidebar / Navigation (Desktop) --- */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-white/10 hidden md:flex flex-col z-50">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#d4af37] to-[#f4d03f] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <i className="fas fa-gem text-black text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">
                SJM <span className="text-[#d4af37]">PRO</span>
              </h1>
              <p className="text-[9px] uppercase tracking-widest text-gray-400">Supplier Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <DashboardLink icon="fa-th-large" label="Dashboard" active />
          <DashboardLink icon="fa-box-open" label="My Stock" to="/stock" />
          <DashboardLink icon="fa-truck-loading" label="Active Deliveries" to="/deliveries" />
          <DashboardLink icon="fa-file-invoice-dollar" label="Invoices" />
          <DashboardLink icon="fa-cog" label="Settings" />
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
               <i className="fas fa-user text-xs text-gray-400"></i>
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name || "Supplier"}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="md:ml-64 min-h-screen relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-white/10 flex justify-between items-center bg-gray-900/80 backdrop-blur-md sticky top-0 z-40">
           <div className="flex items-center gap-2">
             <i className="fas fa-gem text-[#d4af37]"></i>
             <span className="font-bold">SJM Supplier</span>
           </div>
           <button onClick={handleLogout} className="text-gray-400"><i className="fas fa-sign-out-alt"></i></button>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h2 className="text-3xl font-light mb-1 text-gray-400">Welcome back,</h2>
            <h1 className="text-4xl font-bold text-white">{user?.name || "Supplier Partner"}</h1>
            <p className="text-gray-500 mt-2 text-sm max-w-2xl">
              Here is an overview of your supply chain performance, active orders, and current stock valuations.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
             <StatCard 
                icon="fa-shopping-basket" 
                label="Pending Orders" 
                value={stats.pendingOrders} 
                color="text-yellow-400" 
                bg="bg-yellow-400/10"
                borderColor="border-yellow-400/20"
             />
             <StatCard 
                icon="fa-exclamation-triangle" 
                label="Low Stock Alerts" 
                value={stats.lowStockItems} 
                color="text-red-400" 
                bg="bg-red-400/10"
                borderColor="border-red-400/20"
             />
             <StatCard 
                icon="fa-check-circle" 
                label="Completed Deliveries" 
                value={stats.completedDeliveries} 
                color="text-green-400" 
                bg="bg-green-400/10"
                borderColor="border-green-400/20"
             />
             <StatCard 
                icon="fa-wallet" 
                label="Total Revenue" 
                value={`LKR ${(stats.revenue / 1000).toFixed(1)}k`} 
                color="text-[#d4af37]" 
                bg="bg-[#d4af37]/10"
                borderColor="border-[#d4af37]/20"
             />
          </div>

          {/* Approved Orders Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <i className="fas fa-check-circle text-green-400"></i>
                Approved Orders for Production
              </h3>
              <button 
                onClick={fetchApprovedOrders}
                className="px-4 py-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 transition-all"
              >
                <i className="fas fa-sync-alt mr-2"></i>Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <i className="fas fa-spinner fa-spin text-3xl mb-4"></i>
                <p>Loading approved orders...</p>
              </div>
            ) : approvedOrders.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/30 border border-white/5 rounded-3xl">
                <i className="fas fa-inbox text-4xl text-gray-600 mb-4"></i>
                <p className="text-gray-400">No approved orders yet. Orders will appear here once managers approve them.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedOrders.map((order) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -5 }}
                    className="bg-gray-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm hover:border-[#d4af37]/30 transition-all"
                  >
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-white text-lg">{order.orderNumber}</h4>
                        <p className="text-sm text-gray-400">Customer: {order.user?.name || "Unknown"}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase">
                        Approved
                      </span>
                    </div>

                    {/* AI Design Image */}
                    {order.design?.image && (
                      <div className="mb-4">
                        <img
                          src={order.design.image.startsWith('http') ? order.design.image : `http://localhost:5001${order.design.image}`}
                          alt="AI Generated Design"
                          className="w-full h-48 object-cover rounded-xl border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-all cursor-pointer"
                          onClick={() => window.open(order.design.image.startsWith('http') ? order.design.image : `http://localhost:5001${order.design.image}`, '_blank')}
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">Click to enlarge AI design</p>
                      </div>
                    )}

                    {/* Order Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Design Title:</span>
                        <span className="text-white font-medium">{order.design?.title || "Custom Design"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Metal Type:</span>
                        <span className="text-white">{order.customDetails?.metalType || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Size:</span>
                        <span className="text-white">{order.customDetails?.size || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Price:</span>
                        <span className="text-[#d4af37] font-bold">LKR {order.totalPrice?.toLocaleString() || "N/A"}</span>
                      </div>
                    </div>

                    {/* Manager Comment */}
                    {order.managerComment && (
                      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-xs text-blue-400 font-semibold mb-1">Manager Note:</p>
                        <p className="text-sm text-gray-300">{order.managerComment}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 rounded-xl bg-[#d4af37] text-black font-semibold hover:bg-[#d4af37]/90 transition-all">
                        <i className="fas fa-tools mr-2"></i>Start Production
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all">
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// Sub-components for Cleaner Code
const DashboardLink = ({ icon, label, to = "#", active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      active 
      ? "bg-[#d4af37] text-black font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)]" 
      : "text-gray-400 hover:bg-white/5 hover:text-white"
    }`}
  >
    <i className={`fas ${icon} w-6 text-center transition-transform group-hover:scale-110`}></i>
    <span className="text-sm tracking-wide">{label}</span>
  </Link>
);

const StatCard = ({ icon, label, value, color, bg, borderColor }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`p-6 rounded-3xl border ${borderColor} ${bg} backdrop-blur-sm`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-full bg-black/20 flex items-center justify-center ${color}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      {/* Sparkline placeholder */}
      <div className="text-[10px] bg-black/20 px-2 py-1 rounded-full text-white/50">+2.4%</div>
    </div>
    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
  </motion.div>
);
