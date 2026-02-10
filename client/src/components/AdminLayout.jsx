import React from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

export default function AdminLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#d4af37] selection:text-black">
      
      {/* Background Texture */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none z-0"></div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Page Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[#d4af37] rounded-full inline-block"></span>
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-400 mt-2 ml-5 text-sm md:text-base max-w-2xl">
                {subtitle}
              </p>
            )}
          </motion.div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar (Desktop) */}
            <AdminSidebar />
            
            {/* Main Content Area */}
            <motion.main 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 w-full min-w-0"
            >
              <div className="bg-gray-900/40 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
                 {children}
              </div>
            </motion.main>
          </div>
        </div>
      </div>
      
      {/* CSS for custom scrollbar within sidebar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4af37;
        }
      `}</style>
    </div>
  );
}