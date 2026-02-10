import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, Plus, FileText, Calendar, Package, 
  Trash2, Edit, Search, Filter, ExternalLink, RefreshCw 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

import API from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // For manual refresh

  // Fetch Data
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError("");
      
      // FIX: Removed the extra "/api" prefix. 
      // Assuming API.js base URL is 'http://localhost:5001/api'
      const res = await API.get("/deliveries"); 
      
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      
      // Client-side filtering
      const filtered = list.filter(d => {
        const term = search.toLowerCase();
        const supplierName = d.supplierName || d.supplier?.name || "";
        const itemName = d.itemName || "";
        return supplierName.toLowerCase().includes(term) || itemName.toLowerCase().includes(term);
      });

      setDeliveries(filtered);
    } catch (err) {
      console.error("Fetch Error:", err);
      // Fallback for specific 404 to distinguish empty vs endpoint missing
      if (err.response && err.response.status === 404) {
        setError("Deliveries endpoint not found. Please check backend routes.");
      } else {
        setError(err?.response?.data?.message || "Failed to load delivery records.");
      }
      toast.error("Could not load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDeliveries();
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line
  }, [search, refreshKey]);

  // Handlers
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery record?")) return;

    try {
      // FIX: Removed extra "/api"
      await API.delete(`/deliveries/${id}`);
      setDeliveries(prev => prev.filter(d => d._id !== id));
      toast.success("Delivery record removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleRefresh = () => {
    setRefreshKey(old => old + 1);
    toast.success("Refreshing data...");
  };

  return (
    <AdminLayout 
      title="Logistics & Deliveries" 
      subtitle="Track incoming shipments and supplier invoices."
    >
      {/* --- Toolbar Section --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-start md:items-center">
        
        {/* Search Bar */}
        <div className="flex flex-1 gap-3 w-full md:max-w-md">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search supplier or item..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-600"
            />
          </div>
          
          <button 
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Add Button */}
        <Link 
          to="/deliveries/new"
          className="flex items-center gap-2 bg-[#d4af37] text-black px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#f5d040] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Log Delivery</span>
        </Link>
      </div>

      {/* --- Content Area --- */}
      {loading ? (
         <div className="space-y-4">
           {[1, 2, 3, 4].map((i) => (
             <div key={i} className="h-20 bg-gray-900/50 rounded-2xl animate-pulse border border-white/5 flex items-center px-6 gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-white/5 rounded"></div>
                    <div className="h-2 w-1/4 bg-white/5 rounded"></div>
                </div>
             </div>
           ))}
         </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl">
          <p className="text-red-400 font-bold mb-2">System Error</p>
          <p className="text-sm text-red-300/60 mb-4">{error}</p>
          <button 
            onClick={handleRefresh} 
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="bg-gray-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/5">
                  <th className="p-5 font-bold pl-8">Supplier Info</th>
                  <th className="p-5 font-bold">Item Details</th>
                  <th className="p-5 font-bold">Received Date</th>
                  <th className="p-5 font-bold">Status</th>
                  <th className="p-5 font-bold">Docs</th>
                  <th className="p-5 font-bold text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {deliveries.length > 0 ? (
                    deliveries.map((d, index) => (
                      <motion.tr 
                        key={d._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Supplier Info */}
                        <td className="p-5 pl-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/5">
                              <Truck size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">
                                {d.supplierName || d.supplier?.name || "Unknown Supplier"}
                              </p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                                Ref: {d._id.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Item Details */}
                        <td className="p-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Package size={14} className="text-[#d4af37]" />
                                <span className="text-sm text-gray-200 font-medium">{d.itemName || "General Supply"}</span>
                            </div>
                            <span className="text-xs text-gray-500 ml-6">
                                Qty: <span className="text-white">{d.quantity ?? 0}</span> • Cost: <span className="text-white">LKR {d.cost?.toLocaleString() ?? 0}</span>
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                            <Calendar size={12} className="text-gray-300" />
                            {d.date ? format(new Date(d.date), "MMM d, yyyy") : "Pending"}
                          </div>
                        </td>

                        {/* Status (Inferred) */}
                        <td className="p-5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                d.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                'bg-green-500/10 text-green-500 border-green-500/20'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                {d.status || 'Received'}
                            </span>
                        </td>

                        {/* Documents */}
                        <td className="p-5">
                          {d.invoiceUrl ? (
                            <a 
                              href={d.invoiceUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="group/link flex items-center gap-2 text-xs text-[#d4af37] hover:underline"
                            >
                              <FileText size={14} />
                              <span>Invoice</span>
                              <ExternalLink size={10} className="opacity-0 group-hover/link:opacity-100 transition-opacity"/>
                            </a>
                          ) : (
                            <span className="text-gray-600 text-xs italic">No Invoice</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-5 text-right pr-8">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to={`/deliveries/edit/${d._id}`}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#d4af37] hover:text-black flex items-center justify-center transition-all"
                              title="Edit Record"
                            >
                              <Edit size={14} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(d._id)}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                              title="Delete Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-white/5">
                             <Truck size={32} strokeWidth={1.5} />
                          </div>
                          <p className="text-lg font-medium text-gray-300">No delivery records</p>
                          <p className="text-sm mb-4">Log a new shipment to get started</p>
                          <Link 
                            to="/deliveries/new"
                            className="text-[#d4af37] text-sm font-bold hover:underline"
                          >
                            + Log First Delivery
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {/* Footer Info */}
          <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest">
              <span>Total Records: {deliveries.length}</span>
              <span>Last Sync: {format(new Date(), "h:mm a")}</span>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}