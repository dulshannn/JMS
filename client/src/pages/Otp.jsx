import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../utils/api";
import Countdown from "react-countdown"; 

export default function Otp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [attempts, setAttempts] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  
  const userId = localStorage.getItem("userId");
  const userEmail = localStorage.getItem("userEmail") || "your email";
  
  // Create refs for each OTP input
  const inputRefs = useRef([]);

  // Security check on mount
  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    handleSendOtp();
    
    // Start countdown for resend
    const countdownInterval = setInterval(() => {
      setResendCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    
    return () => clearInterval(countdownInterval);
  }, [userId, navigate]);

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrors({});
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when last digit is entered
    if (value && index === 5) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) {
        setTimeout(() => {
          handleVerifyOtp(fullOtp);
        }, 300);
      }
    }
  };

  // Handle backspace and navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
    
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Send OTP function
  const handleSendOtp = async () => {
    try {
      setResendLoading(true);
      setMessage("");
      setErrors({});
      
      await API.post("/auth/send-otp", { userId });
      
      setMessage({
        type: "success",
        text: "Verification code sent successfully! Check your email."
      });
      
      setResendCountdown(60);
      setResendLoading(false);
      
    } catch (error) {
      setErrors({
        server: error?.response?.data?.message || "Failed to send verification code"
      });
      setResendLoading(false);
    }
  };

  // Verify OTP function
  const handleVerifyOtp = async (enteredOtp = otp.join("")) => {
    if (loading || isVerified) return;
    
    if (enteredOtp.length !== 6) {
      setErrors({ otp: "Please enter a 6-digit code" });
      const container = document.getElementById("otpContainer");
      if(container) {
          container.classList.add("animate-shake");
          setTimeout(() => container.classList.remove("animate-shake"), 500);
      }
      return;
    }
    
    try {
      setLoading(true);
      setErrors({});
      setMessage("");
      
      const res = await API.post("/auth/verify-otp", { userId, otp: enteredOtp });
      
      // Save authentication data
      localStorage.setItem("token", res.data.token);
      
      // Get user profile to determine Role
      const me = await API.get("/auth/me");
      const userData = me.data?.data || me.data;
      
      localStorage.setItem("role", userData.role);
      localStorage.setItem("userData", JSON.stringify(userData));
      
      setIsVerified(true);
      setMessage({
        type: "success",
        text: "Verification successful! Redirecting..."
      });
      
      document.getElementById("otpContainer")?.classList.add("animate-success");
      
      // --- UPDATED REDIRECT LOGIC FOR MANAGER ---
      setTimeout(() => {
        if (userData.role === "admin") {
          navigate("/admin-dashboard");
        } else if (userData.role === "manager") {
          navigate("/manager-dashboard"); // ✅ Redirects Manager
        } else if (userData.role === "supplier") {
          navigate("/supplier-dashboard");
        } else {
          navigate("/customer-dashboard");
        }
      }, 1500);
      
    } catch (error) {
      setAttempts(prev => prev + 1);
      const errorMsg = error?.response?.data?.message || "Verification failed";
      setErrors({ server: errorMsg });
      
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      
      const container = document.getElementById("otpContainer");
      if(container) {
          container.classList.add("animate-shake");
          setTimeout(() => container.classList.remove("animate-shake"), 500);
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("").slice(0, 6);
      const paddedOtp = [...newOtp, ...Array(6 - newOtp.length).fill("")];
      setOtp(paddedOtp);
      const lastFilledIndex = newOtp.length - 1;
      if (lastFilledIndex >= 0) {
        inputRefs.current[lastFilledIndex]?.focus();
      }
    }
  };

  const renderCountdown = ({ seconds, completed }) => {
    if (completed) return <span className="text-[#d4af37]">Ready to resend</span>;
    return <span className="text-gray-400">Resend in {seconds}s</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background/Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-[#d4af37]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-l from-[#f4d03f]/10 to-transparent rounded-full blur-3xl"></div>
      </div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] -z-10"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block p-4 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#f4d03f]/10 border border-[#d4af37]/30 mb-6"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center mx-auto">
              <i className="fas fa-shield-alt text-black text-2xl"></i>
            </div>
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-2">Verify Identity</h1>
          <p className="text-sm text-gray-400">Enter code sent to {userEmail}</p>
        </div>

        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl border ${
                message.type === "success" 
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-400"
              }`}
            >
              {message.text}
            </motion.div>
          )}
          {errors.server && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
            >
              {errors.server}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          id="otpContainer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-2xl"
        >
          <div className="mb-8">
            <div className="flex justify-between mb-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <motion.div key={index} whileHover={{ scale: 1.05 }} className="relative">
                  <input
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-14 sm:w-14 sm:h-14 text-center text-2xl font-bold rounded-xl bg-black/50 border ${
                      errors.otp ? "border-red-500/50" : "border-gray-700"
                    } ${digit ? "border-[#d4af37] bg-[#d4af37]/10" : ""} focus:border-[#d4af37] focus:outline-none transition-all`}
                    disabled={loading || isVerified}
                  />
                </motion.div>
              ))}
            </div>
            {errors.otp && <p className="text-red-400 text-xs mt-2">{errors.otp}</p>}
          </div>

          <div className="space-y-4">
            <motion.button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={loading || isVerified}
              whileHover={!loading && !isVerified ? { scale: 1.02 } : {}}
              whileTap={!loading && !isVerified ? { scale: 0.98 } : {}}
              className={`w-full py-3.5 px-6 rounded-xl font-bold transition-all ${
                loading || isVerified
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-black hover:shadow-lg hover:shadow-[#d4af37]/30"
              }`}
            >
              {loading ? "Verifying..." : isVerified ? "Verified!" : "Verify & Continue"}
            </motion.button>
            
            <div className="flex justify-center">
               <button
                type="button"
                onClick={handleSendOtp}
                disabled={resendLoading || resendCountdown > 0}
                className={`text-sm ${resendLoading || resendCountdown > 0 ? "text-gray-500" : "text-[#d4af37] hover:underline"}`}
               >
                 {resendLoading ? "Sending..." : resendCountdown > 0 ? <Countdown date={Date.now() + resendCountdown * 1000} renderer={renderCountdown} /> : "Resend Code"}
               </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      <style>{`
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 40%, 60%, 80% { transform: translateX(5px); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } }
        .animate-success { animation: success 0.5s ease-in-out; }
        @keyframes success { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
}