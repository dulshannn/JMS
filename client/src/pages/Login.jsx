import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "",
    rememberMe: false 
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // --- Password Strength Calculation ---
  const passwordStats = useMemo(() => {
    const pw = formData.password;
    if (!pw) return { score: 0, label: "Enter Password" };
    let score = 0;
    if (pw.length > 6) score += 25;
    if (/[A-Z]/.test(pw)) score += 25;
    if (/[0-9]/.test(pw)) score += 25;
    if (/[^A-Za-z0-9]/.test(pw)) score += 25;

    const labels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
    return { score, label: labels[Math.floor(score / 25)] };
  }, [formData.password]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
    
    // --- FIX: Added safety check for getModifierState ---
    const checkCapsLock = (e) => {
      if (e && typeof e.getModifierState === "function") {
        setCapsLock(e.getModifierState("CapsLock"));
      }
    };

    window.addEventListener("keydown", checkCapsLock);
    return () => window.removeEventListener("keydown", checkCapsLock);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setIsScanning(true); 
      setErrors({}); // Clear previous errors
      
      if (formData.rememberMe) localStorage.setItem("rememberedEmail", formData.email);
      else localStorage.removeItem("rememberedEmail");
      
      const res = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password
      });
      
      // Store userId for OTP step
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("userEmail", formData.email); 
      
      // Delay for visual effect
      setTimeout(() => navigate("/otp"), 1000);
      
    } catch (error) {
      setIsScanning(false);
      // Handle the 401 error gracefully here
      const message = error?.response?.data?.message || "Invalid email or password.";
      setErrors({ server: message });
      
      const form = document.getElementById("loginForm");
      if(form) {
        form.classList.add("animate-shake");
        setTimeout(() => form.classList.remove("animate-shake"), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-black text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* --- CINEMATIC BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50 scale-105">
          <source src="/v1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* --- BRANDING --- */}
        <div className="text-center mb-6">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f4d03f] flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(212,175,55,0.3)] border-2 border-white/10"
          >
            <i className="fas fa-gem text-black text-2xl"></i>
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter">
            SJM <span className="text-[#d4af37]">PRO</span>
          </h1>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.4em] mt-2 font-bold">National Jewellery Management</p>
        </div>

        {/* --- LOGIN CARD --- */}
        <motion.div
          id="loginForm"
          className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative"
        >
          {/* Scanning Line Animation */}
          <AnimatePresence>
            {isScanning && (
              <motion.div 
                initial={{ top: "-100%" }}
                animate={{ top: "100%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-[#d4af37] z-50 opacity-40 blur-sm"
              />
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Login Email</label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-5 py-3.5 pl-12 rounded-2xl bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} focus:border-[#d4af37] transition-all outline-none text-sm`}
                  placeholder="artisan@sjm-pro.lk"
                />
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm group-focus-within:text-[#d4af37]"></i>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
                {capsLock && (
                  <span className="text-[9px] text-orange-500 font-bold uppercase animate-pulse">Caps Lock On</span>
                )}
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-5 py-3.5 pl-12 pr-12 rounded-2xl bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} focus:border-[#d4af37] transition-all outline-none text-sm`}
                  placeholder="••••••••"
                />
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm group-focus-within:text-[#d4af37]"></i>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                </button>
              </div>
              
              <div className="px-1 pt-1">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ 
                      width: `${passwordStats.score}%`,
                      backgroundColor: passwordStats.score < 50 ? "#ef4444" : passwordStats.score < 100 ? "#eab308" : "#22c55e"
                    }}
                    className="h-full"
                  />
                </div>
                <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Security: {passwordStats.label}</p>
              </div>
            </div>

            {/* Utilities */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="hidden" />
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center mr-2 transition-all ${formData.rememberMe ? 'bg-[#d4af37] border-[#d4af37]' : 'border-white/20 group-hover:border-[#d4af37]'}`}>
                  {formData.rememberMe && <i className="fas fa-check text-[10px] text-black"></i>}
                </div>
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">Remember me</span>
              </label>
              <Link to="/forgot-password" hidden className="text-[11px] text-[#d4af37] font-bold uppercase hover:underline">Forgot?</Link>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-black font-black uppercase text-xs tracking-widest shadow-lg shadow-[#d4af37]/20 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center"
            >
              {loading ? <FaSync className="animate-spin mr-2" /> : <i className="fas fa-shield-alt mr-2 text-xs"></i>}
              {loading ? "Verifying..." : "Secure Login"}
            </button>

            {/* Error Message Display */}
            <AnimatePresence>
              {errors.server && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                  <p className="text-red-400 text-[10px] font-bold uppercase italic">{errors.server}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">
              New to SJM PRO?{" "}
              <Link to="/register" className="text-[#d4af37] hover:text-white transition-colors ml-1 underline underline-offset-4 font-black">
                Register Forge
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Global Security Badges */}
        <div className="mt-8 flex justify-center items-center space-x-8 opacity-30 grayscale pointer-events-none">
           <div className="flex items-center gap-2">
             <i className="fas fa-globe-asia text-sm"></i>
             <span className="text-[8px] font-bold uppercase tracking-widest">Sri Lanka Network</span>
           </div>
           <div className="flex items-center gap-2">
             <i className="fas fa-lock text-sm"></i>
             <span className="text-[8px] font-bold uppercase tracking-widest">SSL Encrypted</span>
           </div>
        </div>
      </motion.div>

      <style>{`
        .bg-grid-white {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.25s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}

// Icon Component
const FaSync = ({ className }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
    <polyline points="21 3 21 8 16 8"></polyline>
  </svg>
);