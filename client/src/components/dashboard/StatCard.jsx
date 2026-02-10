import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export default function StatCard({ title, value, change, icon: Icon, color, trend, description, loading }) {
  // Color mapping for dynamic styles
  const colorStyles = {
    gold: "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    gray: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  };

  const currentStyle = colorStyles[color] || colorStyles.gray;

  return (
    <div className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl border ${currentStyle} transition-colors`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${
            trend === "up" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" : 
            trend === "down" ? "text-red-400 border-red-500/20 bg-red-500/10" :
            "text-gray-400 border-gray-500/20 bg-gray-500/10"
          }`}>
            {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
            {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
            {trend === "stable" && <Minus className="w-3 h-3" />}
            <span>{change > 0 ? "+" : ""}{change}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
        ) : (
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        )}
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  );
}