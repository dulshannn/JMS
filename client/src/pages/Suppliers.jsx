import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Filter, Download, Trash2, Edit, 
  MoreVertical, Phone, Mail, MapPin, Building2, 
  CheckSquare, Square, ChevronLeft, ChevronRight, 
  ArrowUpDown, RefreshCw 
} from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../utils/api";
import AdminLayout from "../components/AdminLayout.jsx";

// --- Components ---

const SortIcon = ({ active, direction }) => {
  if (!active) return <ArrowUpDown size={14} className="opacity-30" />;
  return direction === 'asc' 
    ? <ArrowUpDown size={14} className="text-[#d4af37]" />
    : <ArrowUpDown size={14} className="text-[#d4af37] rotate-180" />;
};

export default function Suppliers() {
  // --- State ---
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // --- Data Fetching ---
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        search,
        sortBy: sortConfig.key,
        order: sortConfig.direction,
      };

      if (statusFilter !== "all") params.status = statusFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;

      const res = await API.get("/suppliers", { params });

      const data = res.data?.data || [];
      const meta = res.data?.pagination || {};

      setSuppliers(Array.isArray(data) ? data : []);
      setTotalPages(meta.pages || 1);
      
      // Clear selection on page change
      if (page !== meta.page) setSelectedIds([]);

    } catch (error) {
      console.error(error);
      setError("Failed to retrieve supplier data. Please check your connection.");
      toast.error("Could not fetch suppliers");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortConfig, statusFilter, categoryFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchSuppliers(), 500);
    return () => clearTimeout(timeoutId);
  }, [fetchSuppliers]);

  // --- Handlers ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleCheckbox = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === suppliers.length) {
      setSelectedIds([]); // Deselect all
    } else {
      setSelectedIds(suppliers.map(s => s._id)); // Select all current page
    }
  };

  const handleDelete = async (ids) => {
    if (!ids.length) return;
    if (!window.confirm(`Are you sure you want to deactivate ${ids.length} supplier(s)?`)) return;

    try {
      const endpoint = ids.length === 1 ? `/suppliers/${ids[0]}` : `/suppliers/bulk-delete`;
      const promise = ids.length === 1 ? API.delete(endpoint) : API.post(endpoint, { ids });

      await toast.promise(promise, {
        loading: 'Processing deletion...',
        success: 'Deleted successfully!',
        error: 'Deletion failed'
      });
      
      fetchSuppliers(); // Refresh list
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Action failed");
    }
  };

  const handleExport = () => {
    if (suppliers.length === 0) return toast.error("No data to export");
    
    // Simple CSV Generation
    const headers = ["ID", "Company", "Category", "Contact", "Email", "Status"];
    const rows = suppliers.map(s => [
      s._id, s.companyName, s.category, s.contactPerson, s.email, s.status
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `suppliers_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Supplier list exported");
  };

  return (
    <AdminLayout 
      title="Supplier Network" 
      subtitle="Manage your supply chain partners and contacts."
    >
      {/* --- Toolbar Section --- */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Search & Filter Group */}
            <div className="flex flex-1 gap-3 w-full md:max-w-xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by Company, Email..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-600"
                />
              </div>

              <div className="relative min-w-[140px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-300 focus:border-[#d4af37] outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <option value="all">All Categories</option>
                  <option value="raw_materials">Raw Materials</option>
                  <option value="logistics">Logistics</option>
                  <option value="packaging">Packaging</option>
                  <option value="machinery">Machinery</option>
                </select>
              </div>
            </div>

            {/* Action Buttons Group */}
            <div className="flex gap-3 w-full md:w-auto">
                <button
                    onClick={handleExport}
                    disabled={suppliers.length === 0}
                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={16} />
                    <span className="hidden sm:inline">Export CSV</span>
                </button>
                <Link 
                    to="/suppliers/new"
                    className="flex items-center justify-center gap-2 bg-[#d4af37] text-black px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#f5d040] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all active:scale-95 whitespace-nowrap"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Add Supplier</span>
                </Link>
            </div>
        </div>
        
        {/* Bulk Selection Banner */}
        <AnimatePresence>
            {selectedIds.length > 0 && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl px-4 py-3 flex items-center justify-between overflow-hidden"
                >
                    <div className="flex items-center gap-2 text-[#d4af37]">
                        <CheckSquare size={16} />
                        <span className="text-sm font-semibold">{selectedIds.length} supplier(s) selected</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <button 
                            onClick={() => setSelectedIds([])}
                            className="text-xs text-gray-400 hover:text-white underline"
                         >
                            Cancel
                         </button>
                         <button 
                            onClick={() => handleDelete(selectedIds)}
                            className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                         >
                            <Trash2 size={12} /> Delete Selected
                         </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* --- Content Area --- */}
      {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-900/50 rounded-2xl animate-pulse border border-white/5 flex items-center px-6">
                 <div className="w-12 h-12 rounded-full bg-white/5 mr-4"></div>
                 <div className="flex-1 space-y-2">
                     <div className="h-3 bg-white/10 rounded w-1/3"></div>
                     <div className="h-2 bg-white/5 rounded w-1/4"></div>
                 </div>
              </div>
            ))}
          </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl">
          <p className="text-red-400 font-bold mb-2">Error Loading Data</p>
          <p className="text-sm text-red-300/60">{error}</p>
          <button onClick={fetchSuppliers} className="mt-4 text-xs font-bold underline hover:text-white">Try Again</button>
        </div>
      ) : (
        <div className="bg-gray-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md min-h-[400px] flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/5 select-none">
                  {/* Bulk Select Header */}
                  <th className="p-5 pl-8 w-10 text-center">
                     <button onClick={handleSelectAll} className="opacity-60 hover:opacity-100 transition-opacity">
                        {selectedIds.length === suppliers.length && suppliers.length > 0 
                            ? <CheckSquare size={16} className="text-[#d4af37]" /> 
                            : <Square size={16} />}
                     </button>
                  </th>
                  
                  {/* Sortable Columns */}
                  <th className="p-5 cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => handleSort('companyName')}>
                     <div className="flex items-center gap-2">
                        Company & Contact
                        <SortIcon active={sortConfig.key === 'companyName'} direction={sortConfig.direction} />
                     </div>
                  </th>
                  <th className="p-5 cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => handleSort('category')}>
                     <div className="flex items-center gap-2">
                        Category
                        <SortIcon active={sortConfig.key === 'category'} direction={sortConfig.direction} />
                     </div>
                  </th>
                  <th className="p-5">Contact Details</th>
                  <th className="p-5 cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => handleSort('status')}>
                     <div className="flex items-center gap-2">
                        Status
                        <SortIcon active={sortConfig.key === 'status'} direction={sortConfig.direction} />
                     </div>
                  </th>
                  <th className="p-5 font-bold text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="wait">
                  {suppliers.length > 0 ? (
                    suppliers.map((s, index) => (
                      <motion.tr 
                        key={s._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.03 }}
                        className={`transition-colors group ${selectedIds.includes(s._id) ? 'bg-[#d4af37]/5' : 'hover:bg-white/[0.02]'}`}
                      >
                        {/* Checkbox Cell */}
                        <td className="p-5 pl-8 text-center">
                            <button onClick={() => handleCheckbox(s._id)} className="opacity-60 hover:opacity-100 transition-opacity">
                                {selectedIds.includes(s._id) ? <CheckSquare size={16} className="text-[#d4af37]" /> : <Square size={16} />}
                            </button>
                        </td>

                        {/* Company Info */}
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-[#d4af37] font-bold shadow-lg">
                              {s.companyName?.charAt(0).toUpperCase() || <Building2 size={18} />}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{s.companyName}</p>
                              <p className="text-xs text-gray-500">{s.contactPerson || "No contact person"}</p>
                            </div>
                          </div>
                        </td>
                        
                        {/* Category Badge */}
                        <td className="p-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300 capitalize font-medium">
                            {s.category?.replace('_', ' ') || "General"}
                          </span>
                        </td>

                        {/* Contact Info */}
                        <td className="p-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-gray-400 group/link">
                              <Mail size={12} className="text-[#d4af37]" />
                              <a href={`mailto:${s.email}`} className="group-hover/link:text-white transition-colors">{s.email}</a>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 group/link">
                              <Phone size={12} className="text-[#d4af37]" />
                              <a href={`tel:${s.phone}`} className="group-hover/link:text-white transition-colors">{s.phone || "N/A"}</a>
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="p-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            s.status === 'inactive' 
                              ? "bg-red-500/10 text-red-400 border-red-500/20" 
                              : "bg-green-500/10 text-green-400 border-green-500/20"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'inactive' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                            {s.status || "Active"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-5 text-right pr-8">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to={`/suppliers/edit/${s._id}`}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#d4af37] hover:text-black flex items-center justify-center transition-all"
                              title="Edit Supplier"
                            >
                              <Edit size={14} />
                            </Link>
                            <button 
                              onClick={() => handleDelete([s._id])}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                              title="Delete Supplier"
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
                             <Building2 size={32} strokeWidth={1.5} />
                          </div>
                          <p className="text-lg font-medium text-gray-300">No suppliers found</p>
                          <p className="text-sm text-gray-500">Adjust your filters or add a new partner.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {/* --- Pagination Footer --- */}
          {suppliers.length > 0 && (
             <div className="p-4 border-t border-white/5 bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                <span>
                    Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
                    <span className="mx-2">•</span>
                    Showing {suppliers.length} results
                </span>
                
                <div className="flex items-center gap-2">
                   <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                        <ChevronLeft size={16} />
                   </button>
                   
                   <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                        <ChevronRight size={16} />
                   </button>
                </div>
             </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}