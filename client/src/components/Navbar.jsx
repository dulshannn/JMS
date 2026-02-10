import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Bell, User, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center text-black font-black text-lg shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all">
              S
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              SJM <span className="text-[#d4af37]">PRO</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/profile" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Support
            </Link>
            
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-400 hover:text-[#d4af37] transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-bold text-white">{user.name}</p>
                  <p className="text-[10px] text-[#d4af37] uppercase tracking-wider">{user.role}</p>
                </div>
                <div className="relative group cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-gray-800 border border-white/20 flex items-center justify-center text-[#d4af37] hover:border-[#d4af37] transition-all">
                    <User size={18} />
                  </div>
                  
                  {/* Dropdown (Simple Hover) */}
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0">
                    <div className="py-1">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">
                        Profile Settings
                      </Link>
                      <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all"
              >
                Login Portal
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-gray-900 border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              <Link to="/admin-dashboard" className="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/5">Dashboard</Link>
              <Link to="/orders/manager" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Orders</Link>
              <Link to="/stock" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Stock</Link>
              <div className="border-t border-white/10 my-2 pt-2">
                <button onClick={logout} className="flex w-full items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                    <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}