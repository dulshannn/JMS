import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, Search, Filter, RefreshCw, 
  ArrowUpRight, ArrowDownRight, User, Calendar, FileText 
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

import API from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

export default function StockLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, in, out

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/stock/logs/all");
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      // Sort by newest first if API doesn't
      setLogs(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load history logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtering Logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = (log.itemName || "").toLowerCase().includes(search.toLowerCase()) ||
                            (log.updatedBy?.name || "").toLowerCase().includes(search.toLowerCase());
      
      const change = Number(log.change || 0);
      let matchesType = true;
      if (filterType === "in") matchesType = change > 0;
      if (filterType === "out") matchesType = change < 0;

      return matchesSearch && matchesType;
    });
  }, [logs, search, filterType]);

  return (
    <AdminLayout 
      title="Inventory Audit Logs" 
      subtitle="Track every stock movement and adjustment."
    >
      {/* --- Toolbar --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-start md:items-center">
        
        {/* Search & Filter */}
        <div className="flex flex-1 gap-3 w-full md:max-w-xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search item or staff name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="relative min-w-[140px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-300 focus:border-[#d4af37] outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors"
            >
              <option value="all">All Activity</option>
              <option value="in">Stock Added (+)</option>
              <option value="out">Stock Removed (-)</option>
            </select>
          </div>
        </div>

        <button 
          onClick={() => { fetchLogs(); toast.success("Logs refreshed"); }}
          className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Refresh Logs"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* --- Logs Table --- */}
      <div className="bg-gray-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/5">
                <th className="p-5 font-bold pl-8">Item Details</th>
                <th className="p-5 font-bold">Movement</th>
                <th className="p-5 font-bold">Resulting Stock</th>
                <th className="p-5 font-bold">Authorized By</th>
                <th className="p-5 font-bold text-right pr-8">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    Loading audit history...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <History size={32} strokeWidth={1.5} className="mb-3 opacity-50" />
                      <p>No records found matching your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredLogs.map((log, index) => {
                    const change = Number(log.change || 0);
                    const isPositive = change > 0;
                    const isNeutral = change === 0;

                    return (
                      <motion.tr 
                        key={log._id || index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="p-5 pl-8">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-[#d4af37] border border-white/5">
                              <FileText size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{log.itemName || "Unknown Item"}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                                LOG ID: {log._id ? log._id.slice(-6).toUpperCase() : "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-5">
                          <div className={`inline-flex items-center gap-1 font-mono font-bold text-sm ${
                            isNeutral ? "text-gray-400" : isPositive ? "text-green-400" : "text-red-400"
                          }`}>
                            {isNeutral ? (
                              <span>-</span>
                            ) : isPositive ? (
                              <ArrowUpRight size={16} />
                            ) : (
                              <ArrowDownRight size={16} />
                            )}
                            <span>{change > 0 ? `+${change}` : change}</span>
                          </div>
                        </td>

                        <td className="p-5">
                          <span className="text-gray-300 font-medium">
                            {log.newQuantity ?? "-"} <span className="text-xs text-gray-500">units</span>
                          </span>
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <User size={14} className="text-[#d4af37]" />
                            {log.updatedBy?.name || log.updatedByEmail || "System Admin"}
                          </div>
                        </td>

                        <td className="p-5 text-right pr-8">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-gray-300 text-xs font-medium">
                              {log.createdAt ? format(new Date(log.createdAt), "MMM d, yyyy") : "-"}
                            </span>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Calendar size={10} />
                              {log.createdAt ? format(new Date(log.createdAt), "h:mm a") : ""}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Info */}
        <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest">
           <span>Total Logs: {logs.length}</span>
           <span>Filtered: {filteredLogs.length}</span>
        </div>
      </div>
    </AdminLayout>
  );
}