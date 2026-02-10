import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function QuickAction({ title, description, icon: Icon, to, color }) {
  const colorStyles = {
    gold: "text-[#d4af37] group-hover:bg-[#d4af37]/20",
    blue: "text-blue-400 group-hover:bg-blue-500/20",
    green: "text-emerald-400 group-hover:bg-emerald-500/20",
    red: "text-red-400 group-hover:bg-red-500/20",
    purple: "text-purple-400 group-hover:bg-purple-500/20",
    gray: "text-gray-400 group-hover:bg-gray-500/20",
  };

  const iconColor = colorStyles[color] || colorStyles.gray;

  return (
    <Link
      to={to}
      className="group flex items-center p-4 rounded-xl border border-white/10 bg-black/40 hover:bg-white/5 transition-all hover:border-white/20"
    >
      <div className={`p-3 rounded-lg bg-white/5 transition-colors mr-4 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate group-hover:text-[#d4af37] transition-colors">
          {title}
        </h4>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
    </Link>
  );
}