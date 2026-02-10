import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Users, Truck, Package, ClipboardList, 
  Gem, ShieldCheck, UserCog, User, Settings, LogOut 
} from "lucide-react";

export default function AdminSidebar() {
  const activeClass = "bg-gradient-to-r from-[#d4af37]/20 to-transparent text-[#d4af37] border-l-4 border-[#d4af37]";
  const inactiveClass = "text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent transition-all duration-300";

  const SidebarItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${isActive ? activeClass : inactiveClass}`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );

  const SectionLabel = ({ label }) => (
    <div className="px-4 mt-6 mb-2 text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold">
      {label}
    </div>
  );

  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-100px)] sticky top-24 bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
      
      {/* Header Area */}
      <div className="p-6 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37] flex items-center justify-center text-black font-bold">
                <Settings size={18} />
            </div>
            <div>
                <h2 className="text-white font-bold text-sm">Control Panel</h2>
                <p className="text-xs text-gray-500">SJM Management</p>
            </div>
        </div>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        <SidebarItem to="/admin-dashboard" icon={LayoutDashboard} label="Dashboard" />
        
        <SectionLabel label="Operations" />
        <SidebarItem to="/orders/manager" icon={ClipboardList} label="Order Manager" />
        <SidebarItem to="/customers" icon={Users} label="Customers" />
        <SidebarItem to="/suppliers" icon={Truck} label="Suppliers" />
        <SidebarItem to="/deliveries" icon={Package} label="Deliveries" />

        <SectionLabel label="Inventory" />
        <SidebarItem to="/stock" icon={LayoutDashboard} label="Stock Levels" />
        <SidebarItem to="/stock-logs" icon={ClipboardList} label="Stock Logs" />
        <SidebarItem to="/jewellery" icon={Gem} label="Jewellery Catalog" />
        <SidebarItem to="/locker-verification" icon={ShieldCheck} label="Locker Security" />

        <SectionLabel label="System" />
        <SidebarItem to="/users" icon={UserCog} label="User Roles" />
        <SidebarItem to="/profile" icon={User} label="My Profile" />
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <NavLink 
            to="/login"
            onClick={() => localStorage.clear()}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
            <LogOut size={18} />
            <span>Sign Out</span>
        </NavLink>
      </div>
    </aside>
  );
}