// client/src/components/StatsChart.jsx
import React from "react";

export default function StatsChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
      <h3 className="font-bold mb-4">Order Trends</h3>
      <div className="flex items-end h-40 space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full rounded-t-lg bg-gradient-to-t from-[#d4af37] to-[#f4d03f]"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            ></div>
            <span className="text-xs text-gray-400 mt-2">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}