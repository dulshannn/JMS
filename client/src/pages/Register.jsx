import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/register", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen w-full bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40 scale-105">
          <source src="/v1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/20 to-black/90"></div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md z-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f4d03f] flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-plus text-black text-2xl"></i>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Initialize <span className="text-[#d4af37]">Account</span></h1>
        </div>

        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="FULL NAME" required className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-[#d4af37] text-sm" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder="EMAIL ADDRESS" required className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-[#d4af37] text-sm" onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input type="password" placeholder="SECURE PASSWORD" required className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-[#d4af37] text-sm" onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs shadow-lg">
              {loading ? "Processing..." : "Create Forge Account"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-[10px] font-bold text-gray-500 uppercase hover:text-white transition-colors">Already have a node? Login</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}