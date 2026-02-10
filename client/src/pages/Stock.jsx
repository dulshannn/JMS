import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Search, Filter, Save, AlertTriangle, 
  CheckCircle, ArrowUpRight, ArrowDownRight, RefreshCw 
} from "lucide-react";
import { toast } from "react-hot-toast";

import API from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

export default function Stock() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [editQty, setEditQty] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  const LOW_STOCK_THRESHOLD = 5;

  // Fetch Data
  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await API.get("/stock");
      // Safety check: ensure we have an array
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setStocks(list);

      // Initialize edit state
      const init = {};
      list.forEach((s) => {
        if (s?._id) init[s._id] = s.quantity ?? 0;
      });
      setEditQty(init);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load inventory data");
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // Filtering Logic
  const filteredStocks = useMemo(() => {
    let list = [...stocks];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => (s.itemName || "").toLowerCase().includes(q));
    }

    if (showLowStockOnly) {
      list = list.filter((s) => Number(s.quantity) <= LOW_STOCK_THRESHOLD);
    }

    return list;
  }, [stocks, search, showLowStockOnly]);

  // Update Handler
  const updateQuantity = async (stockId) => {
    try {
      if (!stockId) return; // Prevention
      setUpdatingId(stockId);
      const newQty = Number(editQty[stockId]);
      
      if (Number.isNaN(newQty) || newQty < 0) {
        toast.error("Invalid quantity");
        return;
      }

      await API.put(`/api/stock/${stockId}`, { quantity: newQty });
      
      // Update local state to reflect change immediately
      setStocks(prev => prev.map(s => s._id === stockId ? { ...s, quantity: newQty } : s));
      toast.success("Stock updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats Calculation
  const totalItems = stocks.length;
  const lowStockCount = stocks.filter(s => (s.quantity || 0) <= LOW_STOCK_THRESHOLD).length;
  const totalStockValue = stocks.reduce((acc, s) => acc + (s.quantity || 0), 0);

  return (
    <AdminLayout 
      title="Inventory Management" 
      subtitle="Monitor stock levels and update availability."
    >
      {/* --- Stats Overview --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-gray-900/40 border border-white/5 backdrop-blur-md flex items-center justify-between">
           <div>
             <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Total Items</p>
             <p className="text-2xl font-bold text-white mt-1">{totalItems}</p>
           </div>
           <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
             <Package size={24} />
           </div>
        </div>
        
        <div className="p-5 rounded-2xl bg-gray-900/40 border border-white/5 backdrop-blur-md flex items-center justify-between">
           <div>
             <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Total Units</p>
             <p className="text-2xl font-bold text-white mt-1">{totalStockValue}</p>
           </div>
           <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
             <ArrowUpRight size={24} />
           </div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-900/40 border border-white/5 backdrop-blur-md flex items-center justify-between">
           <div>
             <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Low Stock Alerts</p>
             <p className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? "text-red-400" : "text-white"}`}>{lowStockCount}</p>
           </div>
           <div className={`p-3 rounded-xl ${lowStockCount > 0 ? "bg-red-500/10 text-red-400" : "bg-gray-800 text-gray-500"}`}>
             <AlertTriangle size={24} />
           </div>
        </div>
      </div>

      {/* --- Toolbar --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start md:items-center">
        <div className="flex flex-1 gap-3 w-full md:max-w-xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
            showLowStockOnly 
              ? "bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]" 
              : "bg-black/40 border-white/10 text-gray-400 hover:border-white/20"
          }`}>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={showLowStockOnly} 
              onChange={(e) => setShowLowStockOnly(e.target.checked)} 
            />
            <Filter size={16} />
            <span className="text-sm font-medium">Low Stock</span>
          </label>
        </div>

        <button 
          onClick={fetchStock}
          className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Refresh Inventory"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* --- Inventory Table --- */}
      <div className="bg-gray-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/5">
                <th className="p-5 font-bold pl-8">Item Details</th>
                <th className="p-5 font-bold">Current Stock</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold text-right pr-8">Quick Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500">Loading inventory data...</td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Package size={32} strokeWidth={1.5} className="mb-3 opacity-50" />
                      <p>No inventory items found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredStocks.map((stock, index) => {
                    // Safe ID Handling
                    const stockId = stock._id || `temp-${index}`;
                    const skuDisplay = stock._id ? stock._id.slice(-6).toUpperCase() : "N/A";
                    
                    const qty = Number(stock.quantity ?? 0);
                    const isLow = qty <= LOW_STOCK_THRESHOLD;
                    const isEditing = (editQty[stockId] ?? qty) != qty; // Loose check for string/number diff

                    return (
                      <motion.tr 
                        key={stockId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="p-5 pl-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-[#d4af37] border border-white/5">
                              <Package size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{stock.itemName || "Unknown Item"}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                                SKU: {skuDisplay}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setEditQty(prev => ({ ...prev, [stockId]: Math.max(0, (Number(prev[stockId] ?? qty) || 0) - 1) }))}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors"
                            >
                              -
                            </button>
                            
                            <input
                              type="number"
                              min={0}
                              value={editQty[stockId] ?? qty}
                              onChange={(e) => setEditQty(prev => ({ ...prev, [stockId]: e.target.value }))}
                              className="w-16 bg-transparent text-center font-bold text-white focus:outline-none border-b border-transparent focus:border-[#d4af37] transition-all"
                            />
                            
                            <button 
                              onClick={() => setEditQty(prev => ({ ...prev, [stockId]: (Number(prev[stockId] ?? qty) || 0) + 1 }))}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="p-5">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                              <AlertTriangle size={12} /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                              <CheckCircle size={12} /> In Stock
                            </span>
                          )}
                        </td>

                        <td className="p-5 text-right pr-8">
                          <AnimatePresence>
                            {isEditing && (
                              <motion.button 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => updateQuantity(stockId)}
                                disabled={updatingId === stockId}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#f5d040] shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50"
                              >
                                {updatingId === stockId ? (
                                  <RefreshCw size={14} className="animate-spin" />
                                ) : (
                                  <Save size={14} />
                                )}
                                <span>Save</span>
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest">
           <span>Showing {filteredStocks.length} items</span>
           <span>Threshold: &le;{LOW_STOCK_THRESHOLD} units</span>
        </div>
      </div>
    </AdminLayout>
  );
}