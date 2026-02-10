import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Trash2, Clock, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import API from "../utils/api";
import PageShell from "../components/PageShell.jsx";

const NotificationIcon = ({ type }) => {
  switch (type) {
    case "success": return <CheckCircle className="text-green-400" size={20} />;
    case "warning": return <AlertTriangle className="text-yellow-400" size={20} />;
    default: return <Info className="text-blue-400" size={20} />;
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await API.get("/notifications");
        setNotifications(res.data?.data || []);
      } catch (err) {
        setNotifications([]); // Handle 404
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try { await API.put("/notifications/read-all"); toast.success("Marked all as read"); } catch(e){}
  };

  const filteredList = notifications.filter(n => filter === "all" || (filter === "unread" && !n.isRead));

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#d4af37] selection:text-black">
      <PageShell>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">Notifications</h1>
            <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-xl border border-white/10">
              <button onClick={() => setFilter("all")} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === "all" ? "bg-[#d4af37] text-black" : "text-gray-400 hover:text-white"}`}>All</button>
              <button onClick={() => setFilter("unread")} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === "unread" ? "bg-[#d4af37] text-black" : "text-gray-400 hover:text-white"}`}>Unread</button>
            </div>
          </div>

          {notifications.length > 0 && <div className="flex justify-end mb-4"><button onClick={handleMarkAllRead} className="text-xs font-bold text-gray-400 hover:text-[#d4af37] flex items-center gap-1 transition-colors"><CheckCheck size={14} /> Mark all as read</button></div>}

          <div className="space-y-3">
            {loading ? ([1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-900/50 rounded-2xl animate-pulse border border-white/5"></div>)) : filteredList.length > 0 ? (
              <AnimatePresence>
                {filteredList.map((notif, i) => (
                  <motion.div key={notif._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ delay: i * 0.05 }} className={`relative p-5 rounded-2xl border transition-all ${notif.isRead ? "bg-gray-900/20 border-white/5 opacity-70" : "bg-gray-900/60 border-[#d4af37]/30"}`}>
                    <div className="flex gap-4">
                      <div className={`mt-1 p-2 rounded-full h-fit ${notif.isRead ? "bg-gray-800 text-gray-500" : "bg-white/5"}`}><NotificationIcon type={notif.type} /></div>
                      <div className="flex-1">
                        <p className={`text-sm ${notif.isRead ? "text-gray-400" : "text-white font-medium"}`}>{notif.message}</p>
                        <div className="flex items-center gap-3 mt-2"><p className="text-[10px] text-gray-500 flex items-center gap-1"><Clock size={10} />{format(new Date(notif.createdAt), "MMM d, h:mm a")}</p></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-white/5"><Bell size={32} className="mx-auto mb-4 text-gray-500"/><h3 className="text-lg font-bold text-white">All caught up!</h3></div>
            )}
          </div>
        </div>
      </PageShell>
    </div>
  );
}