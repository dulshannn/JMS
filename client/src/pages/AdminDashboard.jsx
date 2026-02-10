import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BarChart3, Users, Package, Clock, AlertCircle, DollarSign, 
  Settings, RefreshCw, Activity, Calendar, ArrowUpRight, 
  ArrowDownRight, Search, MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays } from "date-fns";
import { toast } from "react-hot-toast";

// Ensure these paths are correct in your project structure
import API from "../utils/api.js";
// import Navbar from "../components/Navbar.jsx"; // Removed to prevent double navbar
import PageShell from "../components/PageShell.jsx";
import NotificationBadge from "../components/NotificationBadge.jsx";
import DateRangePicker from "../components/DateRangePicker.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

// --- UTILITIES ---

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// --- INTERNAL COMPONENTS ---

// 1. Enhanced Revenue Chart (SVG)
const RevenueChart = ({ data }) => {
  // Use data or fallback mock data
  const chartData = useMemo(() => {
    return data?.length > 0 ? data : [40, 65, 45, 80, 55, 90, 75, 100, 85, 120];
  }, [data]);

  // Math safety: Prevent division by zero if max is 0
  const max = Math.max(...chartData) || 1; 

  const points = chartData.map((val, i) => {
    const x = (i / (chartData.length - 1)) * 100;
    const y = 100 - (val / max) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="relative h-48 w-full overflow-hidden mt-4">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M0,100 ${points} 100,100 Z`} fill="url(#goldGradient)" />
        <polyline 
          points={points} 
          fill="none" 
          stroke="#d4af37" 
          strokeWidth="2" 
          vectorEffect="non-scaling-stroke" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
      {/* Grid Lines */}
      <div className="absolute inset-0 border-t border-b border-white/5 pointer-events-none flex flex-col justify-between">
        <div className="border-t border-dashed border-white/5 w-full h-0"></div>
        <div className="border-t border-dashed border-white/5 w-full h-0"></div>
        <div className="border-t border-dashed border-white/5 w-full h-0"></div>
      </div>
    </div>
  );
};

// 2. Enhanced Stat Card with Fixed Tailwind Classes
const DashboardStatCard = ({ title, value, change, icon: Icon, color, delay }) => {
    const isPositive = change >= 0;

    // Tailwind JIT Fix: Lookup table instead of dynamic string construction
    const COLOR_VARIANTS = {
        gold:   "bg-[#d4af37]/10 text-[#d4af37]",
        blue:   "bg-blue-500/10 text-blue-400",
        green:  "bg-green-500/10 text-green-400",
        orange: "bg-orange-500/10 text-orange-400",
        red:    "bg-red-500/10 text-red-400",
        gray:   "bg-gray-500/10 text-gray-400"
    };

    const colorClass = COLOR_VARIANTS[color] || COLOR_VARIANTS.gray;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="p-6 rounded-2xl bg-gray-900/60 border border-white/5 backdrop-blur-sm hover:border-[#d4af37]/30 transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </motion.div>
    );
};

// --- MAIN PAGE COMPONENT ---

const STATS_REFRESH_INTERVAL = 30000;

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);
  
  // Initial Stats State
  const [stats, setStats] = useState({
    totalOrders: 0, pendingApprovals: 0, activeCustomers: 0, revenue: 0,
    completedOrders: 0, newCustomers: 0, avgOrderValue: 0, conversionRate: 0,
    revenueChange: 0, pendingChange: 0, customerChange: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // Dynamic Greeting
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Filter Logic
  const filteredRecentOrders = useMemo(() => {
    return recentOrders.filter(order => {
      const matchesSearch = searchQuery ? 
        Object.values(order).some(value => 
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        ) : true;
      const matchesFilter = filter === "all" || order.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [recentOrders, searchQuery, filter]);

  const unreadNotifications = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Fetch Data
  const fetchDashboardData = useCallback(async () => {
    try {
      setStatsLoading(true);
      setError("");
      
      // Fetch real data from backend
      const [statsRes, activitiesRes, ordersRes, notificationsRes] = await Promise.allSettled([
        API.get("/admin/dashboard/stats"),
        API.get("/admin/dashboard/activities"),
        API.get("/admin/dashboard/orders/recent"),
        API.get("/admin/dashboard/notifications")
      ]);

      // Handle Stats
      if (statsRes.status === "fulfilled" && statsRes.value.data) {
        setStats(statsRes.value.data);
      } else if (statsRes.status === "rejected") {
        console.warn("Failed to fetch stats:", statsRes.reason);
      }

      // Handle Activities
      if (activitiesRes.status === "fulfilled" && activitiesRes.value.data) {
        setRecentActivities(activitiesRes.value.data);
      }

      // Handle Orders
      if (ordersRes.status === "fulfilled" && ordersRes.value.data) {
        setRecentOrders(ordersRes.value.data);
      }

      // Handle Notifications
      if (notificationsRes.status === "fulfilled" && notificationsRes.value.data) {
        setNotifications(notificationsRes.value.data);
      }

    } catch (err) {
      console.error("Dashboard global error:", err);
      setError("Partial data load failure. Some widgets may be empty.");
    } finally {
      setStatsLoading(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, STATS_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success("Dashboard data updated");
  };

  const quickActions = [
    { title: "Manage Orders", icon: Package, to: "/orders/manager", color: "text-[#d4af37]" },
    { title: "Customers", icon: Users, to: "/customers", color: "text-blue-400" },
    { title: "Inventory", icon: BarChart3, to: "/stock", color: "text-green-400" },
    { title: "Settings", icon: Settings, to: "/admin/settings", color: "text-gray-400" },
  ];

  if (loading) {
    return (
      <PageShell title="Admin Dashboard">
        <Loader message="Initializing Dashboard..." fullHeight />
      </PageShell>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#d4af37] selection:text-black">
      {/* Background Grid 
        Note: Removed <Navbar /> here to prevent duplicate navigation bars.
        The PageShell (or Layout wrapper) should handle navigation.
      */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none -z-10"></div>
      
      <PageShell>
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              {timeGreeting}, {user?.name?.split(' ')[0] || "Admin"} <span className="text-2xl">👋</span>
            </h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <Calendar size={14} className="text-[#d4af37]" />
              {format(new Date(), "EEEE, MMMM do, yyyy")}
              <span className="w-1 h-1 rounded-full bg-gray-600 mx-2"></span>
              <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">System Operational</span>
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap items-center gap-3 bg-gray-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-md"
          >
             <NotificationBadge count={unreadNotifications} onClick={() => navigate("/admin/notifications")} />
             
             <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

             <DateRangePicker value={dateRange} onChange={setDateRange} className="bg-black/40 border-transparent hover:bg-black/60" />
             
             <button
              onClick={handleRefresh}
              className="p-2.5 rounded-xl bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all"
              aria-label="Refresh Data"
            >
              <RefreshCw size={18} className={statsLoading ? "animate-spin" : ""} />
            </button>
          </motion.div>
        </div>

        {/* --- ERROR BANNER --- */}
        <AnimatePresence>
          {error && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3"
            >
              <AlertCircle size={20} />
              <p>{error}</p>
              <button onClick={() => setError("")} className="ml-auto text-xs font-bold hover:underline">DISMISS</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardStatCard 
                title="Total Revenue" 
                value={formatCurrency(stats.revenue)} 
                change={stats.revenueChange} 
                icon={DollarSign} 
                color="gold" 
                delay={0.1} 
            />
            <DashboardStatCard 
                title="Pending Orders" 
                value={stats.pendingApprovals} 
                change={stats.pendingChange} 
                icon={Clock} 
                color="orange" 
                delay={0.2} 
            />
            <DashboardStatCard 
                title="Active Users" 
                value={stats.activeCustomers} 
                change={stats.customerChange} 
                icon={Users} 
                color="blue" 
                delay={0.3} 
            />
            <DashboardStatCard 
                title="Avg Order Value" 
                value={formatCurrency(stats.avgOrderValue)} 
                change={2.4} 
                icon={Activity} 
                color="green" 
                delay={0.4} 
            />
        </div>

        {/* --- CHART & QUICK ACTIONS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Revenue Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-gray-900/90 to-black border border-white/5 p-6 backdrop-blur-xl relative overflow-hidden"
            >
                <div className="flex justify-between items-center mb-2 z-10 relative">
                    <div>
                        <h3 className="text-lg font-bold text-white">Revenue Trends</h3>
                        <p className="text-xs text-gray-500">Gross earnings over last 30 days</p>
                    </div>
                    <select className="bg-black/40 border border-white/10 rounded-lg text-xs px-3 py-1 text-gray-300 focus:border-[#d4af37] outline-none">
                        <option>Last 30 Days</option>
                        <option>Last 7 Days</option>
                        <option>This Year</option>
                    </select>
                </div>
                {/* Custom SVG Chart */}
                <RevenueChart data={stats.chartData} />
                
                {/* Chart glow effect */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#d4af37]/10 to-transparent pointer-events-none"></div>
            </motion.div>

            {/* Quick Actions & Activity */}
            <motion.div 
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                 className="flex flex-col gap-6"
            >
                {/* Actions */}
                <div className="bg-gray-900/60 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Access</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action, idx) => (
                            <Link 
                                key={idx} 
                                to={action.to}
                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 transition-all group"
                            >
                                <action.icon size={24} className={`${action.color} mb-2 group-hover:scale-110 transition-transform`} />
                                <span className="text-xs font-medium text-gray-300 group-hover:text-white">{action.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Mini Activity Feed */}
                <div className="flex-1 bg-gray-900/60 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Live Activity</h3>
                    <div className="space-y-4">
                        {recentActivities.length > 0 ? (
                            recentActivities.slice(0, 3).map((act, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-[#d4af37]"></div>
                                    <div>
                                        <p className="text-sm text-gray-200 leading-tight">{act.desc}</p>
                                        <p className="text-[10px] text-gray-500 mt-1">{act.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                           <p className="text-xs text-gray-500 italic">No recent activity.</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>

        {/* --- RECENT ORDERS TABLE --- */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="rounded-3xl border border-white/10 bg-gray-900/40 backdrop-blur-md overflow-hidden"
        >
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <h3 className="text-xl font-bold text-white">Recent Orders</h3>
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-[#d4af37] outline-none transition-all"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:border-[#d4af37] outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="completed">Completed</option>
                    </select>
                    <Link to="/orders/manager" className="text-sm font-bold text-[#d4af37] hover:underline px-2">View All</Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest">
                            <th className="p-4 font-semibold pl-6">Order ID</th>
                            <th className="p-4 font-semibold">Customer</th>
                            <th className="p-4 font-semibold">Amount</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold text-right pr-6">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredRecentOrders.length > 0 ? (
                            filteredRecentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4 pl-6 font-mono text-[#d4af37]">{order.orderNumber}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold">
                                                {order.customerName ? order.customerName.charAt(0) : 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{order.customerName}</p>
                                                <p className="text-xs text-gray-500">{order.productName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-300">
                                        {formatCurrency(order.amount)}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                                            order.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <button className="p-2 rounded-lg hover:bg-[#d4af37] hover:text-black transition-all text-gray-400">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-10 text-center text-gray-500">
                                    No orders found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
      </PageShell>
    </div>
  );
}