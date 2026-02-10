import React from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBadge({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5" />
      
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-black"
          >
            {count > 9 ? "9+" : count}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}