// client/src/components/DesignHistory.jsx
import React from "react";
import { FaHistory, FaEye, FaEdit, FaDownload } from "react-icons/fa";

export default function DesignHistory({ designs, onSelect, onEdit, onDownload }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <FaHistory className="text-[#d4af37] mr-2" />
        Design History
      </h3>
      <div className="space-y-3">
        {designs.map((design) => (
          <div
            key={design.id}
            className="p-4 rounded-xl border border-gray-700 hover:border-gray-600 bg-gray-800/30 flex items-center justify-between"
          >
            <div>
              <h4 className="font-semibold">{design.title}</h4>
              <p className="text-sm text-gray-400">{design.type} • {design.material}</p>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(design.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onSelect(design)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                title="View Design"
              >
                <FaEye />
              </button>
              <button
                onClick={() => onEdit(design)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                title="Edit Design"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onDownload(design)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                title="Download"
              >
                <FaDownload />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}