import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api.js";
import { 
  FaArrowLeft, 
  FaBoxOpen, 
  FaCheckCircle, 
  FaClock, 
  FaShippingFast, 
  FaTimesCircle, 
  FaSearch,
  FaClipboardList
} from "react-icons/fa";

export default function OrderTracking() {
  // --- STATE ---
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [timeline, setTimeline] = useState(null);
  
  // UI States
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // --- DATA FETCHING ---
  const fetchMyOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await API.get("/api/orders/my");
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setOrders(list);

      // Auto-select first order if available
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0]._id);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load your orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchTimeline = async (id) => {
    if (!id) return;
    try {
      setLoadingTimeline(true);
      setError("");
      const res = await API.get(`/api/orders/${id}/timeline`);
      setTimeline(res.data?.data || null);
    } catch (e) {
      console.error(e);
      setError("Failed to load order details.");
      setTimeline(null);
    } finally {
      setLoadingTimeline(false);
    }
  };

  useEffect(() => { fetchMyOrders(); }, []);
  
  useEffect(() => { 
    if (selectedId) fetchTimeline(selectedId); 
  }, [selectedId]);

  // --- HELPER FUNCTIONS ---
  
  // Filter orders based on search
  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  // Status Styles & Icons
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return { color: "text-green-400", bg: "bg-green-400", icon: <FaCheckCircle />, label: "Approved" };
      case "rejected": return { color: "text-red-400", bg: "bg-red-400", icon: <FaTimesCircle />, label: "Rejected" };
      case "completed": 
      case "delivered": return { color: "text-green-400", bg: "bg-green-400", icon: <FaShippingFast />, label: "Delivered" };
      case "ready": return { color: "text-[#d4af37]", bg: "bg-[#d4af37]", icon: <FaBoxOpen />, label: "Ready for Pickup" };
      case "in_progress": return { color: "text-blue-400", bg: "bg-blue-400", icon: <FaClock />, label: "In Progress" };
      default: return { color: "text-gray-400", bg: "bg-gray-500", icon: <FaClipboardList />, label: "Pending Review" };
    }
  };

  // Calculate Progress %
  const getProgress = (status) => {
    const map = { "pending": 10, "approved": 30, "in_progress": 60, "ready": 90, "delivered": 100, "rejected": 100 };
    return map[status?.toLowerCase()] || 0;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <Link to="/customer-dashboard" className="p-3 rounded-full bg-[#1a1a1a] text-[#d4af37] border border-[#d4af37]/20 hover:bg-[#d4af37] hover:text-black transition-all shadow-lg shadow-[#d4af37]/10">
              <FaArrowLeft />
            </Link>
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#d4af37]">Order Tracking</h1>
              <p className="text-gray-400 text-sm">Monitor the status of your custom jewellery requests.</p>
            </div>
          </div>
          
          {/* Refresh Button */}
          <button 
            onClick={() => { fetchMyOrders(); if(selectedId) fetchTimeline(selectedId); }}
            className="px-5 py-2 rounded-xl bg-[#1a1a1a] border border-[#333] text-gray-300 hover:text-[#d4af37] hover:border-[#d4af37] transition-colors text-sm font-semibold"
          >
            Refresh Data
          </button>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: ORDER LIST */}
          <div className="lg:col-span-1 bg-[#111] border border-[#222] rounded-2xl p-6 h-[600px] flex flex-col shadow-xl">
            <h2 className="text-lg font-semibold text-[#d4af37] mb-4 flex items-center gap-2">
              <FaClipboardList /> My Orders
            </h2>

            {/* Search Bar */}
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-3 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-sm focus:border-[#d4af37] focus:outline-none transition-colors"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {loadingOrders ? (
                <div className="text-center py-10 text-gray-500">Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No orders found.</div>
              ) : (
                filteredOrders.map(order => {
                  const statusStyle = getStatusInfo(order.status);
                  const isSelected = selectedId === order._id;
                  
                  return (
                    <div 
                      key={order._id}
                      onClick={() => setSelectedId(order._id)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 group ${
                        isSelected 
                          ? "bg-[#d4af37]/10 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.1)]" 
                          : "bg-[#1a1a1a] border-[#333] hover:border-[#555]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-semibold text-sm ${isSelected ? 'text-[#d4af37]' : 'text-gray-200'}`}>
                          {order.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-black/30 border border-white/10 ${statusStyle.color}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="font-mono">#{order._id.slice(-6)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: DETAILS & TIMELINE */}
          <div className="lg:col-span-2 space-y-6">
            
            {loadingTimeline ? (
              <div className="bg-[#111] border border-[#222] rounded-2xl h-[400px] flex items-center justify-center text-gray-500">
                <div className="animate-pulse">Loading order details...</div>
              </div>
            ) : !timeline ? (
              <div className="bg-[#111] border border-[#222] rounded-2xl h-[400px] flex flex-col items-center justify-center text-gray-500 gap-4">
                <FaBoxOpen className="text-5xl opacity-20" />
                <p>Select an order from the list to view details.</p>
              </div>
            ) : (
              <>
                {/* 1. Order Summary Card */}
                <div className="bg-[#111] border border-[#222] rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{timeline.order.title}</h2>
                        <p className="text-gray-400 text-sm">Order ID: <span className="font-mono text-[#d4af37]">#{timeline.order._id}</span></p>
                      </div>
                      <div className={`px-4 py-2 rounded-full border bg-black/40 flex items-center gap-2 ${getStatusInfo(timeline.order.status).color} border-current`}>
                        {getStatusInfo(timeline.order.status).icon}
                        <span className="font-bold uppercase text-sm tracking-wide">{timeline.order.status}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#222] h-2 rounded-full mb-8 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#d4af37] to-[#f6e7b6] transition-all duration-1000 ease-out"
                        style={{ width: `${getProgress(timeline.order.status)}%` }}
                      ></div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                      <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333]">
                        <span className="block text-gray-500 text-xs uppercase mb-1">Type</span>
                        <span className="text-white font-medium">{timeline.order.type || "N/A"}</span>
                      </div>
                      <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333]">
                        <span className="block text-gray-500 text-xs uppercase mb-1">Material</span>
                        <span className="text-white font-medium">{timeline.order.material || "N/A"}</span>
                      </div>
                      <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333]">
                        <span className="block text-gray-500 text-xs uppercase mb-1">Budget</span>
                        <span className="text-white font-medium">{timeline.order.budget ? `$${timeline.order.budget}` : "N/A"}</span>
                      </div>
                      <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333]">
                        <span className="block text-gray-500 text-xs uppercase mb-1">Deadline</span>
                        <span className="text-white font-medium">{timeline.order.deadline || "None"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Timeline Section */}
                <div className="bg-[#111] border border-[#222] rounded-2xl p-6 md:p-8 shadow-xl">
                  <h3 className="text-lg font-bold text-[#d4af37] mb-6 flex items-center gap-2">
                    <FaClock /> History Log
                  </h3>

                  <div className="relative pl-4 md:pl-8 border-l-2 border-[#333] space-y-8">
                    {timeline.history?.length === 0 ? (
                      <p className="text-gray-500 italic pl-4">No updates recorded yet.</p>
                    ) : (
                      timeline.history.map((log, index) => {
                        const style = getStatusInfo(log.status);
                        return (
                          <div key={index} className="relative pl-6 md:pl-8">
                            {/* Dot on Line */}
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-[#111] ${style.bg} shadow-[0_0_10px_currentColor]`}></div>
                            
                            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 hover:border-[#555] transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <span className={`font-bold ${style.color} uppercase text-xs tracking-wider`}>
                                  {log.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(log.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                              </div>
                              
                              {log.comment && (
                                <p className="text-gray-300 text-sm leading-relaxed mb-2">
                                  "{log.comment}"
                                </p>
                              )}
                              
                              <div className="text-xs text-gray-600">
                                Updated by: <span className="text-gray-500">{log.updatedBy?.name || "System"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}