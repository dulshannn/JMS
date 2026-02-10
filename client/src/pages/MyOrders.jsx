import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Filter, Calendar, CreditCard, ChevronRight, Package } from "lucide-react";
import { format } from "date-fns";
import API from "../utils/api";
import PageShell from "../components/PageShell.jsx";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status?.toLowerCase()] || "bg-gray-500/10 text-gray-400"}`}>
      {status || "Unknown"}
    </span>
  );
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await API.get("/orders/my-orders");
        setOrders(Array.isArray(res.data) ? res.data : res.data?.data || []);
      } catch (err) {
        setOrders([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#d4af37] selection:text-black">
      <PageShell>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div><h1 className="text-3xl font-bold text-white">Order History</h1><p className="text-gray-400 mt-1">Track your past purchases.</p></div>
            <div className="flex w-full md:w-auto gap-3">
              <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} /><input type="text" placeholder="Search order ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#d4af37] outline-none" /></div>
              <div className="relative"><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-full bg-gray-900 border border-white/10 rounded-xl pl-4 pr-8 py-2.5 text-sm text-gray-300 focus:border-[#d4af37] outline-none appearance-none cursor-pointer"><option value="all">All Status</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select><Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} /></div>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? ([1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-900/50 rounded-2xl animate-pulse border border-white/5"></div>)) : filteredOrders.length > 0 ? (
              <AnimatePresence>
                {filteredOrders.map((order, i) => (
                  <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-gray-900/40 border border-white/10 rounded-2xl p-5 hover:bg-gray-900/60 transition-colors group relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]"><ShoppingBag size={20} /></div>
                        <div>
                          <h3 className="font-bold text-white text-lg flex items-center gap-2">{order._id}<span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded">{order.items?.length || 0} items</span></h3>
                          <p className="text-sm text-gray-400 mt-0.5">{order.items?.[0]?.name || "Custom Item"} {order.items?.length > 1 && "..."}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-6 md:gap-12">
                        <div className="flex items-center gap-2 text-sm text-gray-300"><Calendar size={14} className="text-gray-500" />{format(new Date(order.createdAt), "MMM d, yyyy")}</div>
                        <div className="flex items-center gap-2 text-sm font-bold text-white"><CreditCard size={14} className="text-gray-500" />LKR {order.totalAmount?.toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end mt-4 md:mt-0">
                        <StatusBadge status={order.status} />
                        <Link to={`/orders/${order._id}`} className="flex items-center gap-1 text-sm font-bold text-[#d4af37] hover:text-white transition-colors">Details <ChevronRight size={16} /></Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-white/5">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500"><Package size={32} /></div>
                <h3 className="text-xl font-bold text-white">No orders found</h3>
              </div>
            )}
          </div>
        </div>
      </PageShell>
    </div>
  );
}