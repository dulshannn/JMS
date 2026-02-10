import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <div className="text-9xl font-bold text-red-500 mb-4">403</div>
        <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
        <p className="text-gray-400 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-[#d4af37] text-black font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            Go to Home
          </Link>
          <Link
            to="/login"
            className="border border-gray-700 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}