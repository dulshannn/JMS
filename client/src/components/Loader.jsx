import React from "react";
import { Loader2 } from "lucide-react";

export default function Loader({ message = "Loading...", fullHeight = false }) {
  return (
    <div className={`flex flex-col items-center justify-center ${fullHeight ? "min-h-[60vh]" : "py-12"}`}>
      <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin mb-4" />
      <p className="text-gray-400 text-sm font-medium animate-pulse">{message}</p>
    </div>
  );
}