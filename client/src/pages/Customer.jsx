import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Filter, Trash2, Edit, MoreVertical, 
  Mail, Phone, User, CheckCircle, XCircle, Download, 
  ChevronLeft, ChevronRight, ArrowUpDown, Calendar,
  CheckSquare, Square
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

import API from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

// --- Components ---

const SortIcon = ({ active, direction }) => {
  if (!active) return <ArrowUpDown size={14} className="opacity-30" />;
  return direction === 'asc' 
    ? <ArrowUpDown size={14} className="text-[#d4af37]" />
    : <ArrowUpDown size={14} className="text-[#d4af37] rotate-180" />;
};

export default function Customer() {
  // --- State Management ---
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10); // Items per page
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // --- Data Fetching ---
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params = {
        search,
        page,
        limit,
        sortBy: sortConfig.key,
        order: sortConfig.direction,
      };
      
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await API.get("/customers", { params });
      
      // robust data handling
      const data = res.data?.data || [];
      const meta = res.data?.pagination || {};
      
      setCustomers(Array.isArray(data) ? data : []);
      setTotalPages(meta.pages || 1);
      
      // Clear selection on page change/fetch
      if (page !== meta.page) setSelectedIds([]); 

    } catch (err) {
      console.error(err);
      setError("Failed to load customer data.");
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  // Debounced Search & Effect Hooks
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Fetch customers after 500ms delay for search
      fetchCustomers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search, statusFilter, page, sortConfig]);

  // --- Handlers ---

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on search
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to page 1 on filter
  };

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
    if (selectedIds.length === customers.length) {
      setSelectedIds([]); // Deselect all
    } else {
      setSelectedIds(customers.map(c => c._id)); // Select all current page
    }
  };

  const handleDelete = async (ids) => {
    if (!ids.length) return;
    if (!window.confirm(`Are you sure you want to delete ${ids.length} customer(s)? This action is permanent.`)) return;

    try {
      const endpoint = ids.length === 1 ? `/customers/${ids[0]}` : `/customers/bulk-delete`;
      
      const promise = ids.length === 1 
        ? API.delete(endpoint) 
        : API.post(endpoint, { ids });

      await toast.promise(promise, {
        loading: 'Processing deletion...',
        success: 'Deleted successfully!',
        error: 'Deletion failed'
      });
      
      fetchCustomers(); // Refresh data
      setSelectedIds([]); // Clear selection
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Action failed");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      await API.patch(`/customers/${id}/status`, { status: newStatus });
      setCustomers(prev => prev.map(c => 
        c._id === id ? { ...c, status: newStatus } : c
      ));
      toast.success(`Customer status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // CSV Export Logic
  const handleExport = () => {
    if (customers.length === 0) return toast.error("No data to export");
    
    // Construct CSV Header
    const headers = ["ID", "Name", "Email", "Phone", "Status", "Joined"];
    
    // Construct Rows
    const rows = customers.map(c => [
      c._id, 
      c.name, 
      c.email, 
      c.phone || "N/A", 
      c.status,
      format(new Date(c.createdAt), "yyyy-MM-dd")
    ]);

    // Build CSV String
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    // Create Download Link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_export_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV Export started");
  };

  return (
    <AdminLayout 
      title="Customer Management" 
      subtitle="View, edit, and manage your client base."
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
                  placeholder="Search by Name, Email, or ID..." 
                  value={search}
                  onChange={handleSearch}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-600"
                />
              </div>

              <div className="relative min-w-[140px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <select 
                  value={statusFilter} 
                  onChange={handleStatusFilter}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-300 focus:border-[#d4af37] outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Action Buttons Group */}
            <div className="flex gap-3 w-full md:w-auto">
                <button
                    onClick={handleExport}
                    disabled={customers.length === 0}
                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={16} />
                    <span className="hidden sm:inline">Export CSV</span>
                </button>
                <Link 
                    to="/customers/new"
                    className="flex items-center justify-center gap-2 bg-[#d4af37] text-black px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#f5d040] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all active:scale-95 whitespace-nowrap"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>New Customer</span>
                </Link>
            </div>
        </div>
        
        {/* Bulk Selection Notification */}
        <AnimatePresence>
            {selectedIds.length > 0 && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl px-4 py-3 flex items-center justify-between"
                >
                    <div className="flex items-center gap-2 text-[#d4af37]">
                        <CheckSquare size={16} />
                        <span className="text-sm font-semibold">{selectedIds.length} customer(s) selected</span>
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
              <div key={i} className="h-20 bg-gray-900/50 rounded-2xl animate-pulse border border-white/5 flex items-center px-6">
                 <div className="w-10 h-10 rounded-full bg-white/5 mr-4"></div>
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
          <button onClick={fetchCustomers} className="mt-4 text-xs font-bold underline hover:text-white">Try Again</button>
        </div>
      ) : (
        <div className="bg-gray-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md min-h-[400px] flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/5 select-none">
                  {/* Bulk Select Checkbox Header */}
                  <th className="p-5 pl-8 w-10 text-center">
                     <button onClick={handleSelectAll} className="opacity-60 hover:opacity-100 transition-opacity">
                        {selectedIds.length === customers.length && customers.length > 0 
                            ? <CheckSquare size={16} className="text-[#d4af37]" /> 
                            : <Square size={16} />}
                     </button>
                  </th>
                  
                  {/* Sortable Columns */}
                  <th className="p-5 cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => handleSort('name')}>
                     <div className="flex items-center gap-2">
                        Customer Details
                        <SortIcon active={sortConfig.key === 'name'} direction={sortConfig.direction} />
                     </div>
                  </th>
                  <th className="p-5 cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => handleSort('email')}>
                     <div className="flex items-center gap-2">
                        Contact Info
                        <SortIcon active={sortConfig.key === 'email'} direction={sortConfig.direction} />
                     </div>
                  </th>
                  <th className="p-5 cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => handleSort('status')}>
                     <div className="flex items-center gap-2">
                        Status
                        <SortIcon active={sortConfig.key === 'status'} direction={sortConfig.direction} />
                     </div>
                  </th>
                  <th className="p-5 cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => handleSort('createdAt')}>
                     <div className="flex items-center gap-2">
                        Date Joined
                        <SortIcon active={sortConfig.key === 'createdAt'} direction={sortConfig.direction} />
                     </div>
                  </th>
                  <th className="p-5 font-bold text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="wait">
                  {customers.length > 0 ? (
                    customers.map((c, index) => (
                      <motion.tr 
                        key={c._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.03 }}
                        className={`transition-colors group ${selectedIds.includes(c._id) ? 'bg-[#d4af37]/5' : 'hover:bg-white/[0.02]'}`}
                      >
                        {/* Checkbox Cell */}
                        <td className="p-5 pl-8 text-center">
                            <button onClick={() => handleCheckbox(c._id)} className="opacity-60 hover:opacity-100 transition-opacity">
                                {selectedIds.includes(c._id) ? <CheckSquare size={16} className="text-[#d4af37]" /> : <Square size={16} />}
                            </button>
                        </td>

                        {/* User Details Cell */}
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-[#d4af37] font-bold shadow-lg">
                              {c.avatar ? (
                                <img src={c.avatar} alt={c.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <User size={18} />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{c.name}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">ID: {c._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        
                        {/* Contact Info Cell */}
                        <td className="p-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Mail size={12} className="text-[#d4af37]" />
                              {c.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Phone size={12} className="text-[#d4af37]" />
                              {c.phone || "No phone"}
                            </div>
                          </div>
                        </td>

                        {/* Status Cell (Clickable Toggle) */}
                        <td className="p-5">
                          <button 
                            onClick={() => handleToggleStatus(c._id, c.status)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                            c.status === "blocked" || c.isActive === false
                              ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                              : "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                          }`}>
                            {c.status === "blocked" || c.isActive === false ? (
                                <><XCircle size={10} /> Blocked</>
                            ) : (
                                <><CheckCircle size={10} /> Active</>
                            )}
                          </button>
                        </td>

                        {/* Joined Date Cell */}
                        <td className="p-5">
                             <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Calendar size={12} className="text-[#d4af37]" />
                                {format(new Date(c.createdAt), "MMM d, yyyy")}
                             </div>
                        </td>

                        {/* Actions Cell */}
                        <td className="p-5 text-right pr-8">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to={`/customers/edit/${c._id}`}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#d4af37] hover:text-black flex items-center justify-center transition-all"
                              title="Edit Customer"
                            >
                              <Edit size={14} />
                            </Link>
                            <button 
                              onClick={() => handleDelete([c._id])}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                              title="Delete Customer"
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
                             <User size={32} strokeWidth={1.5} />
                          </div>
                          <p className="text-lg font-medium text-gray-300">No customers found</p>
                          <p className="text-sm">Try adjusting your search filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {/* --- Pagination Footer --- */}
          {customers.length > 0 && (
             <div className="p-4 border-t border-white/5 bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                <span>
                    Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
                    <span className="mx-2">•</span>
                    Showing {customers.length} results
                </span>
                
                <div className="flex items-center gap-2">
                   <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                        <ChevronLeft size={16} />
                   </button>
                   
                   {/* Quick Page Jumpers */}
                   {[...Array(Math.min(5, totalPages))].map((_, i) => {
                       // Logic to show pages around current page could be complex, keeping simple here
                       let pNum = i + 1;
                       if (totalPages > 5 && page > 3) pNum = page - 2 + i;
                       if (pNum > totalPages) return null;
                       
                       return (
                           <button
                                key={pNum}
                                onClick={() => setPage(pNum)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium transition-all ${
                                    page === pNum 
                                    ? "bg-[#d4af37] text-black shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                }`}
                           >
                                {pNum}
                           </button>
                       );
                   })}

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