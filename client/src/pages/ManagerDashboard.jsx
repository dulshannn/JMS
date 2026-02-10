import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [commentMap, setCommentMap] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders");
      const ordersData = Array.isArray(res.data) ? res.data : [];
      setOrders(ordersData);
      
      // Calculate stats
      const pending = ordersData.filter(o => o.status === "Pending").length;
      const approvedToday = ordersData.filter(o => 
        o.status === "Processing" && 
        new Date(o.updatedAt).toDateString() === new Date().toDateString()
      ).length;
      const rejectedToday = ordersData.filter(o => 
        o.status === "Cancelled" && 
        new Date(o.updatedAt).toDateString() === new Date().toDateString()
      ).length;
      const revenue = ordersData
        .filter(o => o.status === "Processing" || o.status === "Delivered")
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      setStats({
        pendingOrders: pending,
        approvedToday: approvedToday,
        rejectedToday: rejectedToday,
        totalRevenue: revenue
      });

      // Initialize comment map
      const cm = {};
      ordersData.forEach(o => {
        cm[o._id] = o.managerComment || "";
      });
      setCommentMap(cm);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    try {
      const res = await API.put(`/orders/${orderId}/approve`, {
        managerComment: commentMap[orderId] || ""
      });
      console.log("Order approved:", res.data);
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error("Failed to approve order:", error);
    }
  };

  const handleReject = async (orderId) => {
    try {
      const res = await API.put(`/orders/${orderId}/reject`, {
        managerComment: commentMap[orderId] || ""
      });
      console.log("Order rejected:", res.data);
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error("Failed to reject order:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery ? 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.design?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesFilter = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case "Pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "Processing": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "In Production": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Ready": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Delivered": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Cancelled": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#d4af37] selection:text-black">
      {/* --- Sidebar (Manager) --- */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-white/10 hidden md:flex flex-col z-50">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#d4af37] to-[#f4d03f] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <i className="fas fa-crown text-black text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">
                SJM <span className="text-[#d4af37]">PRO</span>
              </h1>
              <p className="text-[9px] uppercase tracking-widest text-gray-400">Manager Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <DashboardLink icon="fa-chart-line" label="Order Management" active />
          <DashboardLink icon="fa-users" label="Staff Management" to="/users" />
          <DashboardLink icon="fa-gem" label="Inventory Audit" to="/jewellery" />
          <DashboardLink icon="fa-file-contract" label="Reports" />
          <DashboardLink icon="fa-cog" label="Settings" />
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
               <i className="fas fa-user-tie text-xs text-gray-400"></i>
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name || "Manager"}</p>
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
             <i className="fas fa-crown text-[#d4af37]"></i>
             <span className="font-bold">Manager Panel</span>
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
            <h2 className="text-3xl font-light mb-1 text-gray-400">Good Evening,</h2>
            <h1 className="text-4xl font-bold text-white">{user?.name || "Store Manager"}</h1>
            <p className="text-gray-500 mt-2 text-sm max-w-2xl">
              Manage and approve customer orders, monitor production workflow, and ensure quality standards.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
             <StatCard 
                icon="fa-clock" 
                label="Pending Orders" 
                value={stats.pendingOrders} 
                color="text-yellow-400" 
                bg="bg-yellow-400/10"
                borderColor="border-yellow-400/20"
             />
             <StatCard 
                icon="fa-check-circle" 
                label="Approved Today" 
                value={stats.approvedToday} 
                color="text-green-400" 
                bg="bg-green-400/10"
                borderColor="border-green-400/20"
             />
             <StatCard 
                icon="fa-times-circle" 
                label="Rejected Today" 
                value={stats.rejectedToday} 
                color="text-red-400" 
                bg="bg-red-400/10"
                borderColor="border-red-400/20"
             />
             <StatCard 
                icon="fa-coins" 
                label="Total Revenue" 
                value={`LKR ${(stats.totalRevenue / 1000).toFixed(1)}k`} 
                color="text-[#d4af37]" 
                bg="bg-[#d4af37]/10"
                borderColor="border-[#d4af37]/20"
             />
          </div>

          {/* Order Management Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-clipboard-check text-[#d4af37]"></i>
                Customer Order Management
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl bg-black border border-white/10 text-white focus:border-[#d4af37] outline-none w-full sm:w-64"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-black border border-white/10 text-white focus:border-[#d4af37] outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Approved</option>
                  <option value="In Production">In Production</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Rejected</option>
                </select>

                <button
                  onClick={fetchOrders}
                  className="px-4 py-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 transition-all"
                >
                  <i className="fas fa-sync-alt mr-2"></i>Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <i className="fas fa-spinner fa-spin text-3xl mb-4"></i>
                <p>Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/30 border border-white/5 rounded-3xl">
                <i className="fas fa-inbox text-4xl text-gray-600 mb-4"></i>
                <p className="text-gray-400">No orders found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-[#d4af37]/30 transition-all"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Order Info */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-lg font-bold text-white">{order.orderNumber}</h4>
                            <p className="text-sm text-gray-400">
                              Customer: {order.user?.name || "Unknown"} • {order.user?.email || ""}
                            </p>
                            <p className="text-xs text-gray-500">
                              Placed: {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Design Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Design Title</p>
                            <p className="text-white font-medium">{order.design?.title || "Custom Design"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Price</p>
                            <p className="text-[#d4af37] font-bold">LKR {order.totalPrice?.toLocaleString() || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Metal Type</p>
                            <p className="text-white">{order.customDetails?.metalType || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Size</p>
                            <p className="text-white">{order.customDetails?.size || "N/A"}</p>
                          </div>
                        </div>

                        {/* AI Design Image */}
                        {order.design?.image && (
                          <div className="flex items-center gap-4">
                            <img
                              src={order.design.image.startsWith('http') ? order.design.image : `http://localhost:5001${order.design.image}`}
                              alt="AI Generated Design"
                              className="w-20 h-20 object-cover rounded-lg border border-[#d4af37]/20 cursor-pointer hover:border-[#d4af37]/40 transition-all"
                              onClick={() => window.open(order.design.image.startsWith('http') ? order.design.image : `http://localhost:5001${order.design.image}`, '_blank')}
                            />
                            <div>
                              <p className="text-xs text-gray-400">AI Generated Design</p>
                              <p className="text-xs text-[#d4af37] hover:underline cursor-pointer" 
                                 onClick={() => window.open(order.design.image.startsWith('http') ? order.design.image : `http://localhost:5001${order.design.image}`, '_blank')}>
                                Click to enlarge
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Manager Comment */}
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Manager Comment</p>
                          <textarea
                            value={commentMap[order._id] || ""}
                            onChange={(e) => setCommentMap(prev => ({ ...prev, [order._id]: e.target.value }))}
                            placeholder="Add your comments here..."
                            className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:border-[#d4af37] outline-none resize-none"
                            rows="2"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col justify-center gap-3">
                        {order.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(order._id)}
                              className="w-full px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                            >
                              <i className="fas fa-check"></i>
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(order._id)}
                              className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                            >
                              <i className="fas fa-times"></i>
                              Reject
                            </button>
                          </>
                        )}
                        
                        <button className="w-full px-4 py-3 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                          <i className="fas fa-eye"></i>
                          View Details
                        </button>
                      </div>
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

// Components
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
      <div className="text-[10px] bg-black/20 px-2 py-1 rounded-full text-white/50">+2.4%</div>
    </div>
    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
  </motion.div>
);