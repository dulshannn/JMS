import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-500" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-black/40 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-black/60 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] sm:text-sm transition-colors"
        placeholder={placeholder}
      />
    </div>
  );
}