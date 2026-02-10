import React from "react";
import Navbar from "./Navbar";

export default function PageShell({ title, subtitle, children, right }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">{title}</h1>
            {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {right && <div>{right}</div>}
        </div>

        {children}
      </div>
    </div>
  );
}
