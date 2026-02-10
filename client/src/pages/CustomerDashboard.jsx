import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../utils/api";
import PageShell from "../components/PageShell.jsx";
import {
  FaBoxOpen,
  FaSync,
  FaRing,
  FaArrowRight,
  FaShieldAlt,
  FaSearch,
  FaMagic,
  FaDownload,
  FaEye,
  FaRegHeart,
  FaStar,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaCheckCircle,
  FaCircle,
  FaTruck,
  FaMapMarkerAlt,
  FaChevronDown,
  FaStickyNote,
  FaQrcode,
  FaGem,
  FaCrown,
  FaShoppingBag,
  FaGift,
  FaSun,
  FaMoon,
  FaBell,
  FaCaretDown,
  FaChartPie,
  FaHistory,
  FaPercent,
  FaFilter,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaHeart,
  FaPlus,
  FaTimes,
  FaRobot,
  FaImage,
  FaTrash
} from "react-icons/fa";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // --- New AI Studio State ---
  const [aiDesigns, setAiDesigns] = useState([]); 

  // 🌗 THEME LOGIC
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // 📊 STATS & DATA
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    totalValue: 0,
    creditsUsed: 0,
    creditLimit: 10,
    plan: "free",
    loyaltyPoints: 0,
    savedDesigns: 0,
    averageRating: 4.8
  });

  const [goldRate] = useState({ 
    24: "215,400", 
    22: "197,500",
    change24h: "+1.2%"
  });

  const [loyaltyTiers] = useState([
    { name: "Bronze", min: 0, color: "#CD7F32", benefits: ["5% discount"] },
    { name: "Silver", min: 10000, color: "#C0C0C0", benefits: ["10% discount", "Free shipping"] },
    { name: "Gold", min: 50000, color: "#FFD700", benefits: ["15% discount", "Priority support", "Early access"] },
    { name: "Platinum", min: 100000, color: "#E5E4E2", benefits: ["20% discount", "Personal designer", "VIP events"] }
  ]);

  // 📥 LOAD DASHBOARD DATA (With Mock Fallback)
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 1. User Data
      let userData = { name: "Dulshan Kokila", email: "kokila@example.com", plan: "free", generationCount: 2 };
      try {
        const userRes = await API.get("/auth/me");
        if (userRes.data) userData = userRes.data.data || userRes.data;
      } catch (e) {
        console.warn("User endpoint failed (403/404), using mock user data.");
      }
      setUser(userData);

      // 2. Orders Data
      let myOrders = [];
      try {
        // Try the standard endpoint first
        const ordersRes = await API.get("/orders/my");
        myOrders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.data || [];
      } catch (e) {
        console.warn("Orders endpoint failed (404), using mock orders.");
        // Fallback Mock Orders
        myOrders = [
          {
            _id: "mock1",
            orderNumber: "ORD-7842",
            status: "Processing",
            totalPrice: 45000,
            createdAt: new Date().toISOString(),
            design: { title: "Custom Sapphire Ring", type: "Ring", imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400" },
            customDetails: { metalType: "18K Gold", size: "7" }
          }
        ];
      }
      setOrders(myOrders);

      // 3. AI Designs (Mocked)
      // Usually would be await API.get("/ai-studio/my-designs")
      setAiDesigns([
        { id: 101, title: "Sapphire Halo Ring", prompt: "Vintage sapphire ring with halo diamond setting, rose gold band", date: "2023-10-24", imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80" },
        { id: 102, title: "Modern Geometric Pendant", prompt: "Abstract geometric gold pendant, brutalist style", date: "2023-10-20", imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80" },
        { id: 103, title: "Emerald Drop Earrings", prompt: "Victorian style emerald drop earrings, silver setting", date: "2023-10-15", imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80" },
      ]);

      // 4. Notifications (Mocked)
      setNotifications([
        { id: 1, type: "order", message: "Your order #ORD-7842 has been shipped", time: "2 hours ago", read: false },
        { id: 2, type: "promo", message: "New collection launched! Get 15% off", time: "1 day ago", read: true },
        { id: 3, type: "price", message: "Gold price dropped by 1.5%", time: "2 days ago", read: true },
        { id: 4, type: "design", message: "Your AI design is ready for review", time: "3 days ago", read: false },
      ]);

      // Stats Calculation
      const active = myOrders.filter(o => !["Delivered", "Cancelled"].includes(o.status)).length;
      const completed = myOrders.filter(o => o.status === "Delivered").length;
      const totalValue = myOrders
        .filter(o => o.status !== "Cancelled")
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      setStats({
        active,
        completed,
        totalValue,
        creditsUsed: userData.generationCount || 0,
        creditLimit: userData.plan === "premium" ? "∞" : 10,
        plan: userData.plan || "free",
        loyaltyPoints: userData.loyaltyPoints || 1250,
        savedDesigns: 3,
        averageRating: 4.8
      });

      // Static Data
      setQuickActions([
        { icon: FaMagic, label: "AI Studio", action: () => navigate("/ai-studio"), color: "#D4AF37" },
        { icon: FaShoppingBag, label: "Shop Now", action: () => navigate("/shop"), color: "#10B981" },
        { icon: FaQrcode, label: "Track Order", action: () => setActiveTab("tracking"), color: "#3B82F6" },
        { icon: FaGift, label: "Redeem Points", action: () => navigate("/rewards"), color: "#EC4899" },
      ]);

      setRecentlyViewed([
        { id: 1, name: "Heritage Necklace", price: "Rs. 45,000", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=150" },
        { id: 2, name: "Diamond Ring", price: "Rs. 78,500", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=150" },
        { id: 3, name: "Gold Bangle", price: "Rs. 32,000", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=150" },
      ]);

    } catch (err) {
      console.error("Dashboard Critical Error:", err);
      // Even in a critical fail, we don't want a blank screen
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 🔍 FILTERED ORDERS
  const filteredOrders = useMemo(() => {
    let result = orders.filter(order => 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.design?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filterStatus !== "all") {
      result = result.filter(order => order.status === filterStatus);
    }
    
    return result;
  }, [orders, searchQuery, filterStatus]);

  // 📊 LOYALTY TIER CALCULATION
  const getCurrentTier = () => {
    const totalSpent = stats.totalValue;
    for (let i = loyaltyTiers.length - 1; i >= 0; i--) {
      if (totalSpent >= loyaltyTiers[i].min) {
        return loyaltyTiers[i];
      }
    }
    return loyaltyTiers[0];
  };

  const currentTier = getCurrentTier();
  const nextTier = loyaltyTiers[loyaltyTiers.indexOf(currentTier) + 1];
  const progressToNextTier = nextTier 
    ? ((stats.totalValue - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  // 🖼️ HELPER: Get Full Image URL
  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    let cleanPath = url.replace(/\\/g, "/");
    if (!cleanPath.startsWith("/")) cleanPath = `/${cleanPath}`;
    return `http://127.0.0.1:5001${cleanPath}`;
  };

  // 🎨 SUB-COMPONENTS
  const CreditCard = () => {
    const isPremium = stats.plan === 'premium';
    const limit = typeof stats.creditLimit === 'number' ? stats.creditLimit : 100;
    const remaining = isPremium ? 999 : Math.max(0, limit - stats.creditsUsed);
    const progress = isPremium ? 100 : (stats.creditsUsed / limit) * 100;

    return (
      <div className="bg-gradient-to-br from-[#d4af37] via-[#b8941f] to-[#9c7a1a] rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl shadow-[#d4af37]/30 transition-all duration-300 hover:shadow-[#d4af37]/50 group">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">AI Design Credits</p>
              <h3 className="text-2xl font-black mt-1 flex items-center gap-2">
                {isPremium ? "UNLIMITED ACCESS" : `${remaining} CREDITS LEFT`}
                {isPremium && <FaCrown className="text-white animate-pulse" />}
              </h3>
              <p className="text-xs opacity-70 mt-1">Renews monthly</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/30">
              <span className="text-xs font-bold uppercase">{stats.plan} TIER</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="opacity-90">Monthly Usage</span>
              <span>{isPremium ? "∞ Unlimited" : `${stats.creditsUsed} / ${limit}`}</span>
            </div>
            <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-white to-yellow-100 transition-all duration-1000 ease-out" 
                style={{ width: `${isPremium ? 100 : Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <button 
            onClick={() => isPremium ? navigate("/ai-studio") : navigate("/pricing")}
            className="w-full py-3.5 bg-white/20 backdrop-blur-md border border-white/30 text-white font-black uppercase text-xs rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] group-hover:border-white/40"
          >
            {isPremium ? (
              <>
                <FaMagic className="animate-pulse" /> Create New Design
              </>
            ) : (
              <>
                <FaCrown /> Upgrade to Premium
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const LoyaltyCard = () => (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 text-white relative overflow-hidden border border-gray-800 shadow-xl">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <FaGem className="text-6xl" />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Loyalty Status</p>
            <h3 className="text-xl font-black flex items-center gap-2">
              <span style={{ color: currentTier.color }}>{currentTier.name}</span> Member
            </h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black">{stats.loyaltyPoints}</p>
            <p className="text-[10px] text-gray-400">Points</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">Progress to {nextTier?.name || "Max"}</span>
            <span>{Math.round(progressToNextTier)}%</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gray-400 to-white transition-all duration-1000"
              style={{ width: `${Math.min(progressToNextTier, 100)}%` }}
            />
          </div>
          {nextTier && (
            <p className="text-[10px] text-gray-400 mt-1">
              Spend Rs. {(nextTier.min - stats.totalValue).toLocaleString()} more for {nextTier.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {currentTier.benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <FaCheckCircle className="text-green-400 text-xs" />
              <span className="text-gray-300">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const OrdersTable = ({ data, showStatus = true, compact = false }) => (
    <div className={`bg-white dark:bg-[#111] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-300 ${compact ? '' : 'hover:shadow-md'}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Design</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
              {showStatus && <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>}
              <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5">
            {data.length > 0 ? data.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 font-bold text-xs text-gray-700 dark:text-gray-300">
                  <span className="inline-block bg-gray-100 dark:bg-black px-2 py-1 rounded text-[10px]">
                    #{order.orderNumber}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
                      {order.design?.imageUrl && (
                        <img src={getFullImageUrl(order.design.imageUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="design" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block truncate max-w-[150px]">
                        {order.design?.title || "Custom Piece"}
                      </span>
                      <span className="text-[10px] text-gray-400">{order.customDetails?.metalType || "22K Gold"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 dark:text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Rs. {order.totalPrice?.toLocaleString()}</span>
                    <span className="text-[10px] text-green-500 flex items-center gap-1">
                      <FaMoneyBillWave /> Paid
                    </span>
                  </div>
                </td>
                {showStatus && (
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20' : 
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20' : 
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'}`}>
                      <span className={`w-2 h-2 rounded-full animate-pulse ${order.status === 'Delivered' ? 'bg-green-500' : order.status === 'Cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      {order.status}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                      <FaEye className="text-xs" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={showStatus ? 6 : 5} className="px-6 py-12 text-center">
                  <FaBoxOpen className="mx-auto text-gray-200 dark:text-gray-700 text-4xl mb-3" />
                  <p className="text-gray-400 text-xs font-bold uppercase">No orders found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const OrderDetailsCard = ({ order }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-[#d4af37]/10 to-transparent p-6 flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Order Number</span>
            <h3 className="text-xl font-bold dark:text-white">#{order.orderNumber}</h3>
          </div>
          <div className="text-right">
             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
               order.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
             }`}>
               {order.status}
             </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Design Preview */}
            <div className="lg:col-span-3">
               <div className="aspect-square rounded-2xl bg-black border border-gray-100 dark:border-white/10 overflow-hidden">
                  {order.design?.imageUrl ? (
                    <img src={getFullImageUrl(order.design.imageUrl)} className="w-full h-full object-cover" alt="Order design" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><FaGem className="text-gray-800 text-3xl" /></div>
                  )}
               </div>
            </div>

            {/* Content Details */}
            <div className="lg:col-span-9 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2"><FaGem /> Jewelry Specs</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between"><span className="text-gray-500">Material</span><span className="font-bold">{order.customDetails?.metalType || "22K Gold"}</span></li>
                      <li className="flex justify-between"><span className="text-gray-500">Size</span><span className="font-bold">{order.customDetails?.size || "N/A"}</span></li>
                      <li className="flex justify-between"><span className="text-gray-500">Style</span><span className="font-bold">{order.design?.type || "Custom"}</span></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2"><FaTruck /> Shipping to</h4>
                    <p className="text-sm font-medium">{order.shippingAddress?.addressLine || "Matale City Center"}</p>
                    <p className="text-xs text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
                  </div>
               </div>

               <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl italic text-xs text-gray-500">
                  <FaStickyNote className="inline mr-2" /> Notes: {order.customDetails?.notes || "No special instructions provided."}
               </div>

               <div className="flex flex-wrap items-center justify-between pt-4 border-t dark:border-white/5 gap-4">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase block">Total Value</span>
                    <span className="text-2xl font-black text-[#d4af37]">Rs. {order.totalPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-6 py-2.5 bg-black dark:bg-white dark:text-black text-white rounded-xl text-xs font-bold uppercase flex items-center gap-2"><FaQrcode /> Track</button>
                    <button onClick={() => setExpanded(!expanded)} className="p-2.5 border dark:border-white/10 rounded-xl"><FaChevronDown className={expanded ? "rotate-180" : ""} /></button>
                  </div>
               </div>
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 pt-6 border-t dark:border-white/5 overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                        <FaMoneyBillWave className="mx-auto mb-2 text-[#d4af37]" />
                        <p className="text-[10px] uppercase font-black text-gray-400">Paid Via</p>
                        <p className="text-xs font-bold">{order.paymentMethod || "Credit Card"}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                        <FaCalendarAlt className="mx-auto mb-2 text-[#d4af37]" />
                        <p className="text-[10px] uppercase font-black text-gray-400">Order Date</p>
                        <p className="text-xs font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                        <FaShieldAlt className="mx-auto mb-2 text-[#d4af37]" />
                        <p className="text-[10px] uppercase font-black text-gray-400">Order Status</p>
                        <p className="text-xs font-bold">{order.status}</p>
                    </div>
                </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const TrackingTimeline = ({ orders }) => {
    const activeOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status));
    
    return (
      <div className="space-y-6">
        {activeOrders.map(order => (
          <div key={order._id} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-900 dark:text-white">Order #{order.orderNumber}</h4>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
                    In Transit
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Expected Delivery: {new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 14)).toLocaleDateString()}
                </p>
              </div>
              <button className="text-xs font-bold text-[#d4af37] bg-[#d4af37]/10 px-4 py-2 rounded-lg hover:bg-[#d4af37]/20 transition-colors flex items-center gap-2">
                <FaQrcode /> Track Details
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-white/5 -translate-y-1/2 rounded-full" />
              <div className="relative flex justify-between">
                {['Ordered', 'Processing', 'Crafting', 'Quality Check', 'Shipped'].map((step, index) => {
                  const steps = ['Ordered', 'Processing', 'Crafting', 'Quality Check', 'Shipped', 'Delivered'];
                  const currentIdx = steps.indexOf(order.status) === -1 ? 1 : steps.indexOf(order.status);
                  const isCompleted = index <= currentIdx;
                  const isCurrent = index === currentIdx;

                  return (
                    <div key={step} className="flex flex-col items-center gap-2 bg-white dark:bg-[#111] px-2 z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-lg
                        ${isCompleted ? 'bg-[#d4af37] border-[#d4af37] text-white' : 
                          isCurrent ? 'border-[#d4af37] bg-white dark:bg-black' : 
                          'bg-white dark:bg-black border-gray-200 dark:border-white/20 text-gray-300 dark:text-gray-600'}`}>
                        {isCompleted ? (
                          <FaCheckCircle className="text-sm" />
                        ) : isCurrent ? (
                          <div className="w-3 h-3 bg-[#d4af37] rounded-full animate-pulse" />
                        ) : (
                          <FaCircle className="text-[6px]" />
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${isCompleted || isCurrent ? 'text-[#d4af37]' : 'text-gray-300 dark:text-gray-600'}`}>
                        {step}
                      </span>
                      {isCurrent && (
                        <span className="text-[8px] text-gray-500 dark:text-gray-400 mt-1 text-center px-2">
                          Current
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        
        {activeOrders.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-[#111] rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10 transition-colors">
            <FaTruck className="mx-auto text-5xl text-gray-200 dark:text-gray-700 mb-4" />
            <p className="font-bold text-gray-400 text-sm uppercase mb-2">No Active Shipments</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">All your orders have been delivered or are completed</p>
            <button 
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] bg-[#d4af37]/10 px-4 py-2 rounded-lg hover:bg-[#d4af37]/20 transition-colors"
            >
              <FaShoppingBag /> Start Shopping
            </button>
          </div>
        )}
      </div>
    );
  };

  const QuickActionsPanel = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {quickActions.map((action, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.action}
          className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-[#d4af37]/30 transition-all duration-300 group"
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto"
            style={{ backgroundColor: `${action.color}20` }}
          >
            <action.icon className="text-xl" style={{ color: action.color }} />
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block text-center">
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );

  const NotificationsPanel = () => (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
          <button className="text-xs text-[#d4af37] hover:underline">Mark all read</button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            className={`p-4 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 mt-2 rounded-full ${notif.read ? 'bg-gray-300' : 'bg-[#d4af37] animate-pulse'}`} />
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 text-center">
        <button 
          onClick={() => navigate("/notifications")}
          className="text-xs font-bold text-[#d4af37] hover:underline"
        >
          View all notifications
        </button>
      </div>
    </div>
  );

  const UserMenu = () => (
    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d4af37] text-white flex items-center justify-center font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>
      <div className="p-2">
        {[
          { icon: FaUserCircle, label: "My Profile", action: () => navigate("/profile") },
          { icon: FaCog, label: "Settings", action: () => navigate("/settings") },
          { icon: FaHistory, label: "Order History", action: () => setActiveTab("orders") },
          { icon: FaHeart, label: "Wishlist", action: () => navigate("/wishlist") },
          { icon: FaChartPie, label: "Analytics", action: () => navigate("/analytics") },
        ].map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="w-full flex items-center gap-3 p-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <item.icon className="text-gray-400" />
            {item.label}
          </button>
        ))}
      </div>
      <div className="p-2 border-t border-gray-100 dark:border-white/5">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 p-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <FaSignOutAlt />
          Sign Out
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#020202] dark:to-[#0a0a0a] transition-colors duration-300">
        <div className="relative">
          <FaGem className="text-[#d4af37] text-6xl mb-6 animate-pulse" />
          <FaSync className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl animate-spin" />
        </div>
        <p className="font-bold uppercase tracking-[0.4em] text-xs text-gray-400 dark:text-gray-600 mt-4">
          Loading Your Vault...
        </p>
        <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-2">Securely accessing your data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#020202] dark:to-[#0a0a0a] text-gray-800 dark:text-gray-100 font-sans selection:bg-[#d4af37]/30 transition-colors duration-300">
      <PageShell>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          {/* TOP HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                Welcome back, <span className="text-[#d4af37] bg-gradient-to-r from-[#d4af37] to-[#f4d03f] bg-clip-text text-transparent">
                  {user?.name?.split(' ')[0] || "User"}
                </span>
              </h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                Your Personal Jewelry Dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-3 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:text-[#d4af37] dark:hover:text-[#d4af37] transition-all shadow-sm hover:shadow-md"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <FaSun /> : <FaMoon />}
              </button>

              {/* Gold Rates */}
              <div className="hidden lg:flex gap-4 px-5 py-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 transition-colors">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Gold 24K</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#d4af37]">Rs. {goldRate[24]}</span>
                    <span className="text-[10px] text-green-500 font-bold">{goldRate.change24h}</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-100 dark:bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Gold 22K</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Rs. {goldRate[22]}</span>
                </div>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-3 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:text-[#d4af37] dark:hover:text-[#d4af37] transition-all shadow-sm hover:shadow-md relative"
                >
                  <FaBell />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-[#020202] text-[10px] text-white font-bold flex items-center justify-center animate-pulse">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)}
                    />
                    <NotificationsPanel />
                  </>
                )}
              </div>
              
              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-2 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-[#d4af37]/30 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f4d03f] text-white flex items-center justify-center font-bold shadow-lg shadow-[#d4af37]/20">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name?.split(' ')[0]}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{stats.plan.toUpperCase()} PLAN</p>
                  </div>
                  <FaCaretDown className="text-gray-400" />
                </button>
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <UserMenu />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActionsPanel />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">
              <CreditCard />
              
              <LoyaltyCard />

              {/* Stats Card */}
              <div className="bg-white dark:bg-[#111] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 transition-all duration-300 hover:shadow-md">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FaChartPie className="text-[#d4af37]" /> Portfolio Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent rounded-2xl border border-gray-100 dark:border-white/5 transition-colors hover:border-[#d4af37]/20">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Total Spent</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white">Rs. {stats.totalValue.toLocaleString()}</p>
                    <p className="text-[10px] text-green-500 mt-1">+12% from last month</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent rounded-2xl border border-gray-100 dark:border-white/5 transition-colors hover:border-[#d4af37]/20">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Orders</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-lg font-black text-gray-900 dark:text-white">{stats.completed}</p>
                      <p className="text-[10px] text-gray-400 font-normal">/ {orders.length} total</p>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-[#d4af37] rounded-full" 
                        style={{ width: `${(stats.completed / Math.max(orders.length, 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent rounded-2xl border border-gray-100 dark:border-white/5 transition-colors hover:border-[#d4af37]/20">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Saved Designs</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white">{stats.savedDesigns}</p>
                    <button className="text-[10px] text-[#d4af37] hover:underline mt-1">View all</button>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent rounded-2xl border border-gray-100 dark:border-white/5 transition-colors hover:border-[#d4af37]/20">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Avg. Rating</p>
                    <div className="flex items-center gap-1">
                      <p className="text-lg font-black text-gray-900 dark:text-white">{stats.averageRating}</p>
                      <FaStar className="text-[#d4af37] text-xs" />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Based on 8 reviews</p>
                  </div>
                </div>
              </div>

              {/* Recently Viewed */}
              <div className="bg-white dark:bg-[#111] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FaEye className="text-[#d4af37]" /> Recently Viewed
                  </h3>
                  <button className="text-xs text-[#d4af37] hover:underline">Clear All</button>
                </div>
                <div className="space-y-3">
                  {recentlyViewed.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-black overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.price}</p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <FaRegHeart />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="lg:col-span-8">
              {/* Tabs Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    { id: 'overview', icon: FaBoxOpen, label: 'Overview', badge: null },
                    { id: 'orders', icon: FaHistory, label: 'Order History', badge: orders.length },
                    { id: 'tracking', icon: FaTruck, label: 'Live Tracking', badge: stats.active },
                    { id: 'payments', icon: FaCreditCard, label: 'Payments', badge: null },
                    { id: 'designs', icon: FaMagic, label: 'My Designs', badge: stats.savedDesigns },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap relative
                        ${activeTab === tab.id 
                          ? 'bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-black shadow-lg' 
                          : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                    >
                      <tab.icon /> {tab.label}
                      {tab.badge && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#d4af37] text-white text-[10px] rounded-full flex items-center justify-center">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                
                {activeTab === 'orders' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-[#d4af37] transition-colors"
                    >
                      <FaFilter /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-[#d4af37] transition-colors">
                      <FaDownload /> Export
                    </button>
                  </div>
                )}
              </div>

              {/* Filter Panel */}
              {showFilters && activeTab === 'orders' && (
                <div className="mb-6 p-4 bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Filter Orders</h4>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['all', 'Pending', 'Processing', 'Delivered', 'Cancelled'].map(status => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors
                          ${filterStatus === status 
                            ? 'bg-[#d4af37] text-white' 
                            : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                      >
                        {status === 'all' ? 'All Orders' : status}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Recent Activity</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Your latest orders and updates</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input 
                              type="text" 
                              placeholder="Search orders..." 
                              className="pl-8 pr-4 py-2 bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 text-xs focus:border-[#d4af37] outline-none text-gray-700 dark:text-white transition-colors w-48"
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                          <button 
                            onClick={() => setActiveTab('orders')}
                            className="text-xs font-bold text-[#d4af37] hover:underline flex items-center gap-1"
                          >
                            View All <FaArrowRight className="text-xs" />
                          </button>
                        </div>
                      </div>
                      <OrdersTable data={filteredOrders.slice(0, 5)} compact={true} />
                      
                      {/* Promo Banner */}
                      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-2xl font-black mb-2">
                                <span className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] bg-clip-text text-transparent">
                                  Kandyan Collection
                                </span>
                              </h4>
                              <p className="text-gray-300 text-sm mb-6 max-w-lg">
                                Experience the grandeur of traditional Sri Lankan craftsmanship. Our new heritage collection features 24K pure gold pieces with authentic designs.
                              </p>
                              <div className="flex gap-4">
                                <button 
                                  onClick={() => navigate("/ai-studio")}
                                  className="bg-white text-black px-6 py-3 rounded-xl text-xs font-bold uppercase hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
                                >
                                  <FaMagic /> Try AI Studio
                                </button>
                                <button 
                                  onClick={() => navigate("/collection/kandyan")}
                                  className="border-2 border-white/30 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase hover:bg-white/10 transition-colors"
                                >
                                  View Collection
                                </button>
                              </div>
                            </div>
                            <div className="hidden lg:block">
                              <FaRing className="text-8xl text-white/10 group-hover:text-white/20 transition-colors duration-500" />
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
                            <div className="flex items-center gap-2">
                              <FaPercent className="text-green-400" />
                              <span className="text-xs">15% OFF for Gold members</span>
                            </div>
                            <div className="w-px h-4 bg-white/20" />
                            <div className="flex items-center gap-2">
                              <FaGift className="text-yellow-400" />
                              <span className="text-xs">Free shipping on all orders</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div>
                      <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                            <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest">Active Orders</p>
                            <p className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-2">{stats.active}</p>
                          </div>
                          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/5 p-4 rounded-2xl border border-green-100 dark:border-green-500/20">
                            <p className="text-xs font-bold text-green-800 dark:text-green-300 uppercase tracking-widest">Completed</p>
                            <p className="text-2xl font-black text-green-900 dark:text-green-200 mt-2">{stats.completed}</p>
                          </div>
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-500/5 p-4 rounded-2xl border border-purple-100 dark:border-purple-500/20">
                            <p className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-widest">Total Value</p>
                            <p className="text-2xl font-black text-purple-900 dark:text-purple-200 mt-2">Rs. {(stats.totalValue / 1000).toFixed(1)}k</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="relative flex-1 max-w-md">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input 
                              type="text" 
                              placeholder="Search by order ID, design name..." 
                              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-sm focus:border-[#d4af37] outline-none text-gray-700 dark:text-white transition-colors"
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        {filteredOrders.map(order => (
                          <OrderDetailsCard key={order._id} order={order} />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'payments' && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 p-6 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex gap-4 items-start transition-colors">
                        <FaShieldAlt className="text-blue-600 dark:text-blue-400 text-xl" />
                        <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                          <FaShieldAlt className="text-blue-600 dark:text-blue-400 text-xl" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-blue-900 dark:text-blue-300">Secure Payment Ledger</p>
                          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                            All transactions are secured with blockchain verification and end-to-end encryption. Your financial data is protected by bank-grade security.
                          </p>
                        </div>
                      </div>
                      <OrdersTable data={filteredOrders} showStatus={false} />
                    </div>
                  )}

                  {activeTab === 'tracking' && (
                    <div>
                      <div className="mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Live Order Tracking</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Real-time updates on your active shipments. {stats.active} order{stats.active !== 1 ? 's' : ''} in progress
                        </p>
                      </div>
                      <TrackingTimeline orders={orders} />
                    </div>
                  )}

                  {/* 🎨 ENHANCED AI STUDIO TAB */}
                  {activeTab === 'designs' && (
                    <div className="space-y-8">
                      {/* AI Header */}
                      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#000] rounded-3xl p-8 relative overflow-hidden border border-[#d4af37]/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <FaRobot className="text-[#d4af37]" />
                              <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">Vertex AI Studio</span>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Design Your Dream Jewelry</h3>
                            <p className="text-gray-400 text-sm max-w-lg">
                              Use our advanced AI to generate unique jewelry concepts. Describe your vision, and watch it come to life in seconds.
                            </p>
                          </div>
                          <div className="flex gap-4">
                            <button 
                              onClick={() => navigate("/ai-studio")}
                              className="bg-[#d4af37] text-black px-6 py-3 rounded-xl text-sm font-bold uppercase hover:bg-[#b5952f] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center gap-2"
                            >
                              <FaPlus /> New Generation
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* AI Gallery Grid */}
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">My AI Gallery</h3>
                          <span className="text-xs text-gray-500">{aiDesigns.length} saved designs</span>
                        </div>
                        
                        {aiDesigns.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {aiDesigns.map((design) => (
                              <div key={design.id} className="group bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#d4af37]/30 transition-all duration-300">
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                                  <img 
                                    src={design.imageUrl} 
                                    alt={design.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <div className="flex gap-2">
                                      <button className="flex-1 bg-white text-black py-2 rounded-lg text-xs font-bold uppercase hover:bg-gray-200 transition-colors">
                                        View
                                      </button>
                                      <button 
                                        onClick={() => navigate(`/custom-order?design=${design.id}`)}
                                        className="flex-1 bg-[#d4af37] text-black py-2 rounded-lg text-xs font-bold uppercase hover:bg-[#b5952f] transition-colors"
                                      >
                                        Order
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Content */}
                                <div className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate pr-2">{design.title}</h4>
                                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                                      <FaTrash className="text-xs" />
                                    </button>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 h-8">
                                    "{design.prompt}"
                                  </p>
                                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-white/5">
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                      <FaCalendarAlt /> {new Date(design.date).toLocaleDateString()}
                                    </span>
                                    <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                      AI Generated
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {/* 'Create New' Placeholder Card */}
                            <div 
                              onClick={() => navigate("/ai-studio")}
                              className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all group"
                            >
                              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FaMagic className="text-2xl text-gray-400 group-hover:text-[#d4af37]" />
                              </div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Create New Design</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Use your credits to generate unique concepts</p>
                            </div>
                          </div>
                        ) : (
                          // Empty State
                          <div className="text-center py-20 bg-white dark:bg-[#111] rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10">
                            <FaImage className="mx-auto text-5xl text-gray-200 dark:text-gray-700 mb-4" />
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">No Designs Yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
                              You haven't generated any AI designs yet. Visit the studio to create your first piece.
                            </p>
                            <button 
                              onClick={() => navigate("/ai-studio")}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-black px-6 py-3 rounded-xl font-bold uppercase text-sm hover:shadow-lg transition-shadow"
                            >
                              <FaPlus /> Create First Design
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} Vertex Digital. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#d4af37] transition-colors">
                  Privacy Policy
                </button>
                <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#d4af37] transition-colors">
                  Terms of Service
                </button>
                <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#d4af37] transition-colors">
                  Support
                </button>
                <button 
                  onClick={() => loadDashboardData()}
                  className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-[#d4af37] transition-colors"
                >
                  <FaSync /> Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </div>
  );
}