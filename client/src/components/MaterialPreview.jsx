// client/src/components/MaterialPreview.jsx
import React from "react";

export default function MaterialPreview({ material, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'border-[#d4af37] bg-[#d4af37]/10'
          : 'border-gray-700 hover:border-gray-600'
      }`}
    >
      <div className="flex space-x-2 mb-3">
        {material.colors.map((color, index) => (
          <div
            key={index}
            className="w-8 h-8 rounded-lg border border-gray-700"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <h4 className="font-semibold">{material.name}</h4>
      <p className="text-sm text-gray-400 capitalize">{material.type}</p>
    </div>
  );
}