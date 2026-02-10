import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../utils/api";
import PageShell from "../components/PageShell.jsx";

import {
  FaMagic, FaGem, FaRing, FaLink, FaCircle, FaRegCircle,
  FaCube, FaHistory, FaSync, FaLightbulb, FaCheck,
  FaArrowLeft, FaShoppingCart, FaFileInvoice, FaTimes,
  FaStar, FaCrown, FaLock, FaRulerHorizontal, FaStickyNote,
  FaChartPie, FaCreditCard, FaMoneyBillWave, FaClock
} from "react-icons/fa";

export default function AIStudio() {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Design State
  const [designPrompt, setDesignPrompt] = useState("");
  const [designType, setDesignType] = useState("ring");
  const [currentDesign, setCurrentDesign] = useState(null);
  const [designHistory, setDesignHistory] = useState([]);
  
  // Customization State
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedStone, setSelectedStone] = useState("");
  const [size, setSize] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  
  // UI State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageError, setImageError] = useState(false);
  
  // Modals
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState("");

  // --- CONFIGURATION ---
  const designTypes = [
    { id: "ring", name: "Ring", icon: FaRing, sizes: ["US 5", "US 6", "US 7", "US 8", "US 9", "US 10"] },
    { id: "necklace", name: "Necklace", icon: FaLink, sizes: ["16 inch", "18 inch", "20 inch", "22 inch", "24 inch"] },
    { id: "earring", name: "Earrings", icon: FaCircle, sizes: ["Stud", "Drop", "Hoop"] },
    { id: "bracelet", name: "Bracelet", icon: FaRegCircle, sizes: ["6 inch", "6.5 inch", "7 inch", "7.5 inch"] },
    { id: "tiara", name: "Tiara", icon: FaCrown, sizes: ["Standard", "Adjustable"] }
  ];

  const promptSuggestions = {
    styles: ["Kandyan Traditional", "Art Deco", "Minimalist Modern", "Filigree Gold", "Vintage Royal"],
    stones: ["Blue Ceylon Sapphire", "Padparadscha", "Matale Ruby", "Green Emerald", "Star Sapphire"]
  };

  // --- EFFECTS ---
  useEffect(() => { loadDesignHistory(); }, []);
  useEffect(() => { setImageError(false); }, [currentDesign]);
  useEffect(() => { setSize(""); }, [designType]);

  const loadDesignHistory = async () => {
    try {
      const res = await API.get("/designs/history");
      if (res.data?.success) {
        setDesignHistory(res.data.data || []);
      }
    } catch (err) { console.error("History error:", err.message); }
  };

  // --- ACTIONS ---

  const handleEnhancePrompt = () => {
    if (!designPrompt) return;
    const enhanced = `High-end professional jewelry photography of a ${designType}, ${designPrompt}${selectedStyle ? ', ' + selectedStyle + ' style' : ''}${selectedStone ? ', featuring ' + selectedStone : ''}, solid 22k Sri Lankan gold, intricate craftsmanship, isolated on plain white background, 8k resolution, cinematic studio lighting, macro lens focus.`;
    setDesignPrompt(enhanced);
    setSuccess("Prompt optimized by AI!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const handleGenerateDesign = async () => {
    if (!designPrompt.trim()) {
      setError("Please describe your design first.");
      return;
    }
    
    try {
      setGenerating(true);
      setError("");
      setShowLimitModal(false);
      
      const res = await API.post("/designs/generate", {
        designPrompt,
        designType,
        customizations: { style: selectedStyle, complexity: "High" }
      });
      
      if (res.data.success) {
        const savedDesign = res.data.data;
        setCurrentDesign(savedDesign);
        setDesignHistory(prev => [savedDesign, ...prev]);
        setSuccess("Design forged successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      if (err.response?.status === 403) {
          setShowLimitModal(true);
      } else {
          setError(err.response?.data?.error || "Server Error.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleBuyNow = () => {
    if (!size) {
      setError("Please select a size first.");
      return;
    }
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setProcessingPayment(true);
    setError("");

    // Simulate Payment Gateway Delay
    await new Promise(r => setTimeout(r, 2000));

    try {
        const orderPayload = {
            design: currentDesign._id,
            totalPrice: currentDesign.customizations?.estimatedCost || 185000,
            shippingAddress: { city: "Matale", country: "Sri Lanka", addressLine: "No 95, Ukuwela" },
            customDetails: {
                size: size,
                notes: specialNotes || "None",
                metalType: "22K Gold"
            },
            paymentMethod: "Card",
            isPaid: true
        };

        const res = await API.post("/orders/ai", orderPayload);

        if (res.data.success) {
            setLastOrderNumber(res.data.data.orderNumber);
            setShowPaymentModal(false);
            setShowOrderSuccess(true);
            setSuccess("Payment successful!");
            
        }
    } catch (err) {
        console.error("Payment Error:", err);
        setError("Payment failed. Please try again.");
    } finally {
        setProcessingPayment(false);
    }
  };

  const handleLoadFromHistory = (design) => {
    setCurrentDesign(design);
    setDesignType(design.type || "ring");
    setDesignPrompt(design.prompt || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    let cleanPath = url.replace(/\\/g, "/");
    if (!cleanPath.startsWith("/")) cleanPath = `/${cleanPath}`;
    return `http://127.0.0.1:5001${cleanPath}`;
  };

  const MarketAnalysis = ({ cost }) => {
    if (!cost) return null;
    const goldCost = cost * 0.65;
    const gemCost = cost * 0.20;
    const makingCharges = cost * 0.15;

    return (
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl mt-4">
        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 flex items-center gap-2">
          <FaChartPie /> Market Value Breakdown
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">22K Gold Weight</span>
            <span className="text-yellow-400 font-bold">Rs. {goldCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-gray-400">Craftsmanship</span>
            <span className="text-purple-400 font-bold">Rs. {makingCharges.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-1 text-sm">
            <span className="font-bold text-white">Total Estimate</span>
            <span className="font-black text-[#d4af37]">Rs. {cost.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <PageShell title="AI Studio Forge" subtitle="Matale Premium Jewellery Visualizer">
        
        {/* LIMIT MODAL */}
        <AnimatePresence>
          {showLimitModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gray-900 border border-[#d4af37] p-8 rounded-[2.5rem] max-w-md w-full text-center">
                <FaLock className="text-[#d4af37] text-3xl mx-auto mb-4" />
                <h2 className="text-2xl font-black uppercase mb-2">Limit Reached</h2>
                <p className="text-gray-400 mb-6 text-sm">Upgrade to Premium for unlimited AI designs.</p>
                <button onClick={() => navigate("/pricing")} className="w-full py-4 bg-[#d4af37] text-black font-black uppercase rounded-2xl mb-3">Upgrade Now</button>
                <button onClick={() => setShowLimitModal(false)} className="w-full py-4 bg-white/5 text-white rounded-2xl text-xs uppercase">Close</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PAYMENT MODAL */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-white text-gray-900 p-8 rounded-[2rem] max-w-lg w-full relative">
                <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 text-gray-400"><FaTimes /></button>
                <h2 className="text-2xl font-black uppercase flex items-center gap-3 mb-6"><FaCreditCard className="text-[#d4af37]" /> Checkout</h2>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                  <div className="flex justify-between mb-2 text-sm"><span>Item</span><span className="font-bold">{designType}</span></div>
                  <div className="flex justify-between mb-2 text-sm"><span>Size</span><span className="font-bold">{size}</span></div>
                  <div className="flex justify-between pt-2 border-t font-black text-lg"><span>Total</span><span className="text-[#d4af37]">Rs. {currentDesign?.customizations?.estimatedCost?.toLocaleString()}</span></div>
                </div>

                {processingPayment ? (
                  <div className="py-8 text-center"><FaSync className="animate-spin text-4xl text-[#d4af37] mx-auto mb-4" /><p className="text-sm font-bold uppercase">Processing...</p></div>
                ) : (
                  <button onClick={processPayment} className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-3">
                    <FaLock /> Pay Now
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ORDER SUCCESS MODAL */}
        <AnimatePresence>
          {showOrderSuccess && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gray-900 border border-[#d4af37]/30 p-8 rounded-[2.5rem] max-w-md w-full text-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><FaCheck className="text-green-400 text-3xl" /></div>
                <h2 className="text-2xl font-black uppercase mb-2">Order Confirmed!</h2>
                <p className="text-gray-400 mb-6 text-sm">Order <span className="text-[#d4af37] font-bold">#{lastOrderNumber}</span> placed successfully.</p>
                <button onClick={() => navigate("/customer-dashboard")} className="w-full py-4 bg-[#d4af37] text-black font-black uppercase rounded-2xl">Go to Dashboard</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-gray-900/50 border border-white/10 rounded-[2.5rem] p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center"><FaLightbulb className="text-[#d4af37] mr-3" /> 1. Describe</h2>
                <button onClick={handleEnhancePrompt} className="text-xs font-bold bg-[#d4af37]/10 text-[#d4af37] px-4 py-2 rounded-xl border border-[#d4af37]/20 hover:bg-[#d4af37]/20 flex items-center"><FaMagic className="mr-2" /> Enhance</button>
              </div>
              <textarea value={designPrompt} onChange={(e) => setDesignPrompt(e.target.value)} placeholder="Ex: A heavy gold bangle with ruby inlays..." className="w-full h-32 px-6 py-5 bg-black/50 border border-white/5 rounded-3xl focus:border-[#d4af37]/50 text-lg outline-none" />
            </div>

            <div className="bg-gray-900/50 border border-white/10 rounded-[2.5rem] p-8">
              <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center"><FaRing className="text-[#d4af37] mr-3" /> 2. Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {designTypes.map((t) => (
                  <button key={t.id} onClick={() => setDesignType(t.id)} className={`p-5 rounded-3xl border flex flex-col items-center gap-3 transition-all ${designType === t.id ? 'bg-[#d4af37] text-black' : 'bg-white/5 border-white/5 text-gray-500'}`}><t.icon className="text-2xl" /><span className="text-[10px] font-black uppercase">{t.name}</span></button>
                ))}
              </div>
            </div>
            
            <button onClick={handleGenerateDesign} disabled={generating || !designPrompt} className="w-full py-6 rounded-[2rem] font-black text-xl bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-black shadow-xl disabled:opacity-20 flex items-center justify-center space-x-4">
              {generating ? <FaSync className="animate-spin" /> : <FaStar />} <span>{generating ? "Forging..." : "Forge Design"}</span>
            </button>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="bg-gray-900/50 border border-white/10 rounded-[3rem] p-4 shadow-2xl sticky top-8">
               <div className="aspect-square rounded-[2.5rem] bg-black border border-white/5 overflow-hidden relative group">
                  {currentDesign?.imageUrl && !imageError ? (
                    <motion.img key={currentDesign._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={getFullImageUrl(currentDesign.imageUrl)} className="w-full h-full object-cover" onError={() => setImageError(true)} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-800 italic">
                      <FaCube className="text-6xl mb-4 opacity-10" />
                      <span className="text-xs uppercase tracking-[0.3em] opacity-30">Awaiting Forge</span>
                    </div>
                  )}
                  {generating && <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center"><div className="w-16 h-16 border-t-2 border-[#d4af37] rounded-full animate-spin" /></div>}
               </div>

               {currentDesign && (
                 <div className="p-6">
                    <div className="flex justify-between items-end mb-6">
                      <div><p className="text-[10px] font-black text-gray-500 uppercase">Estimate</p><p className="text-3xl font-black text-[#d4af37]">Rs. {currentDesign.customizations?.estimatedCost?.toLocaleString()}</p></div>
                    </div>

                    <div className="space-y-4 mb-6">
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block"><FaRulerHorizontal className="inline mr-2" /> Size</label>
                          <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none">
                             <option value="" disabled>Choose size</option>
                             {designTypes.find(t => t.id === designType)?.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block"><FaStickyNote className="inline mr-2" /> Notes</label>
                          <textarea value={specialNotes} onChange={(e) => setSpecialNotes(e.target.value)} placeholder="Engravings..." className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm h-20 outline-none" />
                       </div>
                    </div>

                    <MarketAnalysis cost={currentDesign.customizations?.estimatedCost} />

                    <div className="flex gap-4 mt-6">
                      <button onClick={handleBuyNow} className="flex-[2] py-4 bg-white text-black rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2"><FaShoppingCart /> Buy Now</button>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {designHistory.length > 0 && (
          <div className="mt-20 border-t border-white/10 pt-10">
            <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3"><FaHistory className="text-[#d4af37]" /> History</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                {designHistory.map((item) => (
                    <div key={item._id} onClick={() => handleLoadFromHistory(item)} className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-[#d4af37]/30 transition-all">
                        <div className="aspect-square bg-black">
                            <img src={getFullImageUrl(item.imageUrl)} className="w-full h-full object-cover" alt="history" />
                        </div>
                        <div className="p-3">
                            <p className="text-[9px] font-black text-gray-500 uppercase flex justify-between">
                                <span>{item.type}</span>
                                <span className="text-[#d4af37]">Rs. {(item.customizations?.estimatedCost / 1000).toFixed(0)}k</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </PageShell>
    </div>
  );
}