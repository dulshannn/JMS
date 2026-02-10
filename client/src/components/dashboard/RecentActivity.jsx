import React from "react";
import { formatDistanceToNow } from "date-fns";
import { User, ShoppingBag, Settings, AlertCircle, CheckCircle } from "lucide-react";

export default function RecentActivity({ activity }) {
  // Helper to choose icon based on activity type
  const getIcon = (type) => {
    switch (type) {
      case "order": return <ShoppingBag className="w-4 h-4 text-blue-400" />;
      case "user": return <User className="w-4 h-4 text-purple-400" />;
      case "system": return <Settings className="w-4 h-4 text-gray-400" />;
      case "alert": return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "success": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default: return <User className="w-4 h-4 text-[#d4af37]" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
      <div className="mt-1 p-2 rounded-full bg-white/5 border border-white/10">
        {getIcon(activity.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200">
          <span className="font-medium text-white">{activity.user || "System"}</span>{" "}
          {activity.action}
          {activity.target && <span className="text-[#d4af37] font-medium"> {activity.target}</span>}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : "Just now"}
        </p>
      </div>
    </div>
  );
}