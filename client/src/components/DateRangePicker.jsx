import React from "react";
import { Calendar } from "lucide-react";
import { subDays, startOfDay, endOfDay } from "date-fns";

export default function DateRangePicker({ value, onChange, className = "" }) {
  // Helper to quickly set ranges
  const handleRangeChange = (days) => {
    const end = new Date();
    const start = subDays(end, days);
    onChange({ start, end });
  };

  return (
    <div className={`flex items-center gap-2 p-1 bg-black/40 border border-white/10 rounded-lg ${className}`}>
      <div className="pl-2 text-gray-500">
        <Calendar className="w-4 h-4" />
      </div>
      <select
        className="bg-transparent text-sm text-gray-300 border-none focus:ring-0 cursor-pointer py-1 pr-8"
        onChange={(e) => handleRangeChange(Number(e.target.value))}
        defaultValue="30"
      >
        <option value="7">Last 7 Days</option>
        <option value="30">Last 30 Days</option>
        <option value="90">Last 3 Months</option>
        <option value="365">Last Year</option>
      </select>
    </div>
  );
}