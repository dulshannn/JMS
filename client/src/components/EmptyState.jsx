import React from "react";
import { PackageOpen } from "lucide-react"; // Default icon

export default function EmptyState({ 
  icon: Icon = PackageOpen, 
  title = "No data found", 
  message = "Nothing to display here yet.", 
  action 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 rounded-full bg-white/5 mb-4 border border-white/10">
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      <p className="text-gray-400 text-sm max-w-sm mb-6">{message}</p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}