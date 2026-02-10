// client/src/components/LoadingSkeleton.jsx
import React from "react";

export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-800 rounded w-1/4"></div>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
        ))}
      </div>
      <div className="h-64 bg-gray-800 rounded-xl"></div>
    </div>
  );
}