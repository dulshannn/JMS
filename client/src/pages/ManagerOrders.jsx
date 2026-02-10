import React, { useEffect, useState, useCallback } from "react";
import { 
  Search, Filter, CheckCircle, XCircle, Clock, 
  ChevronDown, ExternalLink, RefreshCw, Truck, Package, 
  DollarSign, MapPin, Mail, Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import API from "../utils/api.js";
import PageShell from "../components/PageShell.jsx";

// --- STATUS CONFIGURATION ---
const STATUS_CONFIG = {
  Pending: { color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock },
  Approved: { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle },
  Processing: { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: RefreshCw },
  Shipped: { color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Truck },
  Delivered: { color: "text-gray-400 bg-gray-400/10 border-gray-400/20", icon: Package },
  Cancelled: { color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
  Rejected: { color: "text-red-500 bg-red-500/10 border-red-500/20", icon: XCircle },
};

// Helper for Image URLs
const getImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/150?text=No+Design";
  return path.startsWith("http") ? path : `http://localhost:5001${path}`;
};

// --- SUB-COMPONENT: ORDER ROW ---
const OrderRow = ({ order, refreshData }) => {
  const [status, setStatus] = useState(order.status || "Pending");
  const [comment, setComment] = useState(order.managerComment || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // NOTE: The backend aggregation returns 'customerDetails', not 'user'
  const customer = order.customerDetails || {}; 
  const design = order.designDetails || order.design || {};

  const handleUpdate = async (specificStatus) => {
    setIsProcessing(true);
    const targetStatus = specificStatus || status;

    try {
      const res = await API.put(`/orders/${order._id}/status`, { 
        status: targetStatus, 
        comment 
      });
      toast.success(res.data?.message || "Order updated");
      if(specificStatus) setStatus(specificStatus);
      refreshData();
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const StatusIcon = STATUS_CONFIG[status]?.icon || Clock;

  return (
    <>
      <motion.tr 
        layout
        className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${isExpanded ? "bg-white/[0.02]" : ""}`}
      >
        {/* 1. ORDER ID & DATE */}
        <td className="p-4 align-top w-[15%]">
          <div className="flex flex-col">
             <span className="font-mono text-[#d4af37] font-bold tracking-wider text-sm">
               {order.orderNumber}
             </span>
             <span className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
               <Clock size={10} />
               {order.createdAt ? format(new Date(order.createdAt), "MMM d, HH:mm") : "N/A"}
             </span>
          </div>
        </td>

        {/* 2. CUSTOMER DETAILS */}
        <td className="p-4 align-top w-[25%]">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-[#d4af37] font-bold shrink-0">
                {customer.name?.charAt(0).toUpperCase() || "G"}
            </div>
            
            {/* Info */}
            <div className="space-y-0.5 overflow-hidden">
              <div className="font-semibold text-white text-sm truncate" title={customer.name}>
                {customer.name || "Guest User"}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 truncate" title={customer.email}>
                <Mail size={10} />
                <span>{customer.email}</span>
              </div>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[10px] text-[#d4af37] hover:underline flex items-center gap-1 mt-1.5"
              >
                {isExpanded ? "Close Details" : "View Details"}
              </button>
            </div>
          </div>
        </td>

        {/* 3. ITEM & SPECS */}
        <td className="p-4 align-top w-[25%]">
          <div className="flex gap-3">
             <div className="w-12 h-12 rounded-lg bg-black border border-white/10 overflow-hidden shrink-0 relative group/img">
                <img src={getImageUrl(design.image || design.imageUrl)} className="w-full h-full object-cover" alt="design" />
                <a 
                  href={getImageUrl(design.image || design.imageUrl)} 
                  target="_blank" rel="noreferrer"
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                >
                   <ExternalLink size={12} className="text-white"/>
                </a>
             </div>
             <div className="space-y-1">
                <div className="text-sm font-medium text-gray-200 line-clamp-1" title={design.title}>
                  {design.title || "Custom Design"}
                </div>
                <div className="text-[10px] text-gray-400 flex flex-col">
                   <span>Metal: <span className="text-gray-300">{order.customDetails?.metalType}</span></span>
                   <span>Total: <span className="text-[#d4af37] font-bold">LKR {order.totalPrice?.toLocaleString()}</span></span>
                </div>
             </div>
          </div>
        </td>

        {/* 4. MANAGER ACTIONS */}
        <td className="p-4 align-top w-[20%]">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-black/40 border border-white/20 rounded-lg py-1.5 pl-2 pr-6 text-[11px] text-gray-300 focus:border-[#d4af37] outline-none appearance-none disabled:opacity-50 cursor-pointer"
              >
                {Object.keys(STATUS_CONFIG).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={10} />
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Internal Note..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[11px] text-white focus:border-[#d4af37] outline-none resize-none h-10 placeholder:text-gray-600"
            />
            
            {(status !== order.status || comment !== order.managerComment) && (
              <button 
                onClick={() => handleUpdate()}
                disabled={isProcessing}
                className="w-full py-1 text-[10px] bg-[#d4af37] text-black font-bold rounded hover:bg-[#b5952f] transition-colors"
              >
                {isProcessing ? "Saving..." : "Save Update"}
              </button>
            )}
          </div>
        </td>

        {/* 5. STATUS BADGE & QUICK BTNS */}
        <td className="p-4 align-top w-[15%] text-right">
           <div className="flex flex-col items-end gap-2">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${STATUS_CONFIG[status]?.color || STATUS_CONFIG.Pending.color}`}>
                 <StatusIcon size={10} />
                 {status}
              </div>

              {status === 'Pending' && (
                <div className="flex gap-1 mt-1">
                   <button 
                     onClick={() => handleUpdate("Approved")}
                     disabled={isProcessing}
                     className="p-1.5 rounded bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all"
                     title="Approve"
                   >
                     <CheckCircle size={14} />
                   </button>
                   <button 
                     onClick={() => handleUpdate("Rejected")}
                     disabled={isProcessing}
                     className="p-1.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                     title="Reject"
                   >
                     <XCircle size={14} />
                   </button>
                </div>
              )}
           </div>
        </td>
      </motion.tr>
      
      {/* EXPANDED DETAILS */}
      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/[0.02] border-b border-white/5"
          >
            <td colSpan={5} className="p-0">
               <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-400 bg-black/20 inset-shadow-sm">
                  {/* Shipping Info */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-[#d4af37] flex items-center gap-2 uppercase tracking-wider">
                      <MapPin size={12}/> Shipping Address
                    </h4>
                    <div className="pl-5 border-l border-white/10">
                      <p className="text-white">{order.shippingAddress?.addressLine || "No street provided"}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  <div className="space-y-2">
                     <h4 className="font-bold text-[#d4af37] flex items-center gap-2 uppercase tracking-wider">
                       <DollarSign size={12}/> Payment & Notes
                     </h4>
                     <div className="pl-5 border-l border-white/10 space-y-1">
                       <p>Method: <span className="text-white">{order.paymentMethod}</span></p>
                       <p>Paid: <span className={order.isPaid ? "text-green-400" : "text-red-400"}>{order.isPaid ? "Yes" : "No"}</span></p>
                       <p className="mt-2 text-gray-500 italic">" {order.customDetails?.notes || "No notes"} "</p>
                     </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                     <h4 className="font-bold text-[#d4af37] flex items-center gap-2 uppercase tracking-wider">
                       <Phone size={12}/> Contact
                     </h4>
                     <div className="pl-5 border-l border-white/10 space-y-1">
                        <p>{customer.email}</p>
                        <p>{customer.phone || "No phone number"}</p>
                        <p className="text-[10px] text-gray-500 mt-2">ID: {customer._id}</p>
                     </div>
                  </div>
               </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function ManagerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "all" });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders", { params: filters });
      
      // Handle the aggregation response structure
      // Our backend returns { success: true, count: X, data: [...] }
      const list = res.data?.data || [];
      setOrders(list);
    } catch (e) {
      console.error(e);
      toast.error("Connection failed. Retrying...");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 400); // Debounce
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#d4af37] selection:text-black">
      <PageShell>
        <div className="max-w-7xl mx-auto px-4 py-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 border-b border-white/10 pb-6 gap-4">
               <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Order Management</h1>
                  <p className="text-gray-400 mt-2 text-sm">
                    Track, approve, and manage customer orders in real-time.
                  </p>
               </div>
               <div className="text-right">
                   <div className="text-3xl font-bold text-[#d4af37]">{orders.length}</div>
                   <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Total Orders</div>
               </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
               {/* Search */}
               <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search Order #, Customer Name, or Email..."
                    value={filters.search}
                    onChange={(e) => setFilters(p => ({...p, search: e.target.value}))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-600"
                  />
               </div>

               {/* Filter */}
               <div className="w-full md:w-56 relative group">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
                  <select 
                     value={filters.status}
                     onChange={(e) => setFilters(p => ({...p, status: e.target.value}))}
                     className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-8 text-sm text-white focus:border-[#d4af37] outline-none appearance-none cursor-pointer"
                  >
                     <option value="all">All Statuses</option>
                     {Object.keys(STATUS_CONFIG).map(s => (
                       <option key={s} value={s}>{s}</option>
                     ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
               </div>

               {/* Sync Button */}
               <button 
                 onClick={fetchOrders}
                 className="px-6 py-3 bg-[#d4af37] text-black border border-[#d4af37] rounded-xl hover:bg-[#b5952f] transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-[#d4af37]/20 active:scale-95"
               >
                 <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                 <span className="hidden md:inline">Sync</span>
               </button>
            </div>

            {/* Orders Table */}
            <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm min-h-[400px]">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-white/5 text-[11px] uppercase tracking-widest text-gray-400 border-b border-white/10 font-bold">
                          <th className="p-4 pl-6">Order ID</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Design Specs</th>
                          <th className="p-4">Workflow</th>
                          <th className="p-4 pr-6 text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {!loading && orders.length > 0 ? (
                          orders.map(order => (
                             <OrderRow key={order._id} order={order} refreshData={fetchOrders} />
                          ))
                       ) : (
                          <tr>
                             <td colSpan={5} className="p-20 text-center">
                                {loading ? (
                                   <div className="flex flex-col items-center gap-3 text-gray-500">
                                      <RefreshCw className="animate-spin text-[#d4af37]" size={32} />
                                      <span className="animate-pulse">Retrieving order data...</span>
                                   </div>
                                ) : (
                                   <div className="flex flex-col items-center gap-3 text-gray-500">
                                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                        <Search size={24} className="opacity-50"/>
                                      </div>
                                      <span>No orders found matching your search.</span>
                                      <button 
                                        onClick={() => setFilters({search:"", status:"all"})}
                                        className="text-[#d4af37] text-sm hover:underline"
                                      >
                                        Clear Filters
                                      </button>
                                   </div>
                                )}
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
               </div>
            </div>

        </div>
      </PageShell>
    </div>
  );
}