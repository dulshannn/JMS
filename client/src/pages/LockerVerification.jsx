import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Search, Camera, AlertTriangle, CheckCircle, 
  Lock, FileText, Upload, RefreshCw, X 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

import API from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

export default function LockerVerification() {
  const [tab, setTab] = useState("storage"); // storage | showcase | return
  const [jewellery, setJewellery] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Item, 2: Locker Details, 3: Verification
  const [lockerStats, setLockerStats] = useState({
    inLocker: 0,
    inShowcase: 0,
    totalItems: 0,
    lockerItems: [] // Track individual items in locker
  });
  
  // Form State
  const [form, setForm] = useState({
    jewelleryId: "",
    lockerNumber: "",
    quantity: 1,
    notes: "",
    result: "matched", // matched | mismatch
    mismatchReason: "",
  });
  const [preview, setPreview] = useState(null); // Image preview

  // Fetch Jewellery for Dropdown
  const loadJewellery = async () => {
    try {
      const res = await API.get("/jewellery");
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setJewellery(list);
    } catch {
      toast.error("Could not load jewellery list");
    }
  };

  // Fetch Logs based on Tab
  const loadLogs = async () => {
    try {
      setLoading(true);
      // Map workflow tabs to backend stage names
      const stageMap = {
        "storage": "before",    // Put items INTO locker
        "showcase": "after",    // Take items FROM locker for showcase
        "return": "before",      // Return items FROM showcase TO locker
        "history": "all"        // View all transactions
      };
      const stage = stageMap[tab] || "before";
      
      const res = await API.get("/locker", { params: { stage } });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setLogs(list);
      
      // Calculate locker statistics
      calculateLockerStats();
    } catch (err) {
      console.error(err);
      toast.error("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  // Calculate locker statistics
  const calculateLockerStats = async () => {
    try {
      // Get all logs to calculate current state
      const allLogsRes = await API.get("/locker", { params: { stage: "all" } });
      const allLogs = Array.isArray(allLogsRes.data) ? allLogsRes.data : [];
      
      // Track items by their current status and details
      const itemStatus = {};
      const lockerItems = [];
      
      allLogs.forEach(log => {
        const itemId = log.jewelleryId?._id || log.jewelleryId;
        const itemInfo = {
          id: itemId,
          name: log.jewelleryId?.name || "Unknown Item",
          type: log.jewelleryId?.type || "Unknown",
          lockerNumber: log.lockerNumber,
          quantity: log.quantity || 1,
          stage: log.stage,
          timestamp: log.createdAt
        };
        
        if (log.stage === "before") {
          // Item is in locker (stored or returned)
          itemStatus[itemId] = itemInfo;
        } else if (log.stage === "after") {
          // Item is in showcase
          delete itemStatus[itemId];
        }
      });
      
      // Convert to array for display
      const lockerItemsArray = Object.values(itemStatus);
      const inLockerCount = lockerItemsArray.length;
      const inShowcaseCount = Object.keys(itemStatus).filter(itemId => !itemStatus[itemId]).length;
      
      setLockerStats({
        inLocker: inLockerCount,
        inShowcase: inShowcaseCount,
        totalItems: inLockerCount + inShowcaseCount,
        lockerItems: lockerItemsArray
      });
    } catch (err) {
      console.error("Failed to calculate locker stats:", err);
    }
  };

  useEffect(() => {
    loadJewellery();
  }, []);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line
  }, [tab]);

  // Handlers
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Convert File to Base64 for simple storage
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.jewelleryId) return toast.error("Please select a jewellery item");
    if (!form.lockerNumber.trim()) return toast.error("Locker number is required");
    if (form.result === "mismatch" && !form.mismatchReason.trim()) return toast.error("Please specify the mismatch reason");
    
    // Validate quantity
    const selectedItem = jewellery.find(j => j._id === form.jewelleryId);
    const availableQuantity = selectedItem?.quantity || 0;
    if (form.quantity > availableQuantity) {
      return toast.error(`Only ${availableQuantity} units available for this item`);
    }
    if (form.quantity < 1) {
      return toast.error("Quantity must be at least 1");
    }

    try {
      // Map workflow tabs to backend stage names
      const stageMap = {
        "storage": "before",    // Put items INTO locker
        "showcase": "after",    // Take items FROM locker for showcase
        "return": "before",      // Return items FROM showcase TO locker
        "history": "before"      // Default for history tab
      };
      const stage = stageMap[tab] || "before";

      const payload = {
        ...form,
        stage: stage,
        proofImage: preview // Sending Base64 string
      };

      await API.post("/locker", payload);
      
      // Success messages based on workflow
      const successMessages = {
        "storage": `${form.quantity} item(s) successfully stored in locker`,
        "showcase": `${form.quantity} item(s) successfully taken for showcase`,
        "return": `${form.quantity} item(s) successfully returned to locker`,
        "history": "Verification saved successfully"
      };
      toast.success(successMessages[tab] || "Verification saved successfully");
      
      // Reset Form
      setForm({
        jewelleryId: "",
        lockerNumber: "",
        quantity: 1,
        notes: "",
        result: "matched",
        mismatchReason: "",
      });
      setPreview(null);
      loadLogs(); // Refresh table
      loadJewellery(); // Refresh jewellery list to update quantities
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed");
    }
  };

  return (
    <AdminLayout 
      title="Locker Management System" 
      subtitle="Secure vault access control and item verification."
    >
      {/* --- Process Tabs --- */}
      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
        <button
          onClick={() => { setTab("storage"); setCurrentStep(1); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            tab === "storage"
              ? "bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
              : "bg-black/40 text-gray-400 hover:text-white border border-white/10"
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Store in Locker
        </button>
        <button
          onClick={() => { setTab("showcase"); setCurrentStep(1); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            tab === "showcase"
              ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              : "bg-black/40 text-gray-400 hover:text-white border border-white/10"
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          Take to Showcase
        </button>
        <button
          onClick={() => { setTab("return"); setCurrentStep(1); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            tab === "return"
              ? "bg-orange-600 text-white shadow-[0_0_15px_rgba(251,146,60,0.4)]"
              : "bg-black/40 text-gray-400 hover:text-white border border-white/10"
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          Return to Locker
        </button>
        <button
          onClick={() => { setTab("history"); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            tab === "history"
              ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]"
              : "bg-black/40 text-gray-400 hover:text-white border border-white/10"
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          Transaction History
        </button>
      </div>

      {/* --- Progress Steps for Check-in/Checkout --- */}
      {tab !== "history" && (
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className={`flex items-center gap-3 ${currentStep >= 1 ? "text-[#d4af37]" : "text-gray-500"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep >= 1 ? "bg-[#d4af37] text-black" : "bg-gray-700 text-gray-400"
              }`}>
                1
              </div>
              <span className="font-medium">Select Item</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? "bg-[#d4af37]" : "bg-gray-700"}`}></div>
            <div className={`flex items-center gap-3 ${currentStep >= 2 ? "text-[#d4af37]" : "text-gray-500"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep >= 2 ? "bg-[#d4af37] text-black" : "bg-gray-700 text-gray-400"
              }`}>
                2
              </div>
              <span className="font-medium">Locker Details</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? "bg-[#d4af37]" : "bg-gray-700"}`}></div>
            <div className={`flex items-center gap-3 ${currentStep >= 3 ? "text-[#d4af37]" : "text-gray-500"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep >= 3 ? "bg-[#d4af37] text-black" : "bg-gray-700 text-gray-400"
              }`}>
                3
              </div>
              <span className="font-medium">Verify & Complete</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT: Verification Form --- */}
        <div className="lg:col-span-1">
          {/* Locker Statistics */}
          <div className="bg-gray-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md mb-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="text-[#d4af37]" />
              Current Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{lockerStats.inLocker}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">In Locker</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{lockerStats.inShowcase}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">In Showcase</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Items Tracked</span>
                <span className="text-lg font-bold text-[#d4af37]">{lockerStats.totalItems}</span>
              </div>
            </div>
          </div>

          {/* Current Locker Items */}
          {lockerStats.lockerItems.length > 0 && (
            <div className="bg-gray-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="text-green-400" />
                Items Currently in Locker
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {lockerStats.lockerItems.map((item, index) => (
                  <div key={item.id} className="bg-black/30 border border-white/10 rounded-xl p-3 flex items-center justify-between hover:bg-black/50 transition-all">
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">{item.name}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                        <span className="bg-gray-700 px-2 py-1 rounded text-xs">{item.type}</span>
                        <span className="text-gray-500">Qty: {item.quantity}</span>
                        <span className="text-gray-500">Locker: {item.lockerNumber}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(item.timestamp), "MMM d, h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md sticky top-24">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="text-[#d4af37]" />
              New Verification
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Jewellery Item</label>
                <select
                  name="jewelleryId"
                  value={form.jewelleryId}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#d4af37] outline-none appearance-none"
                >
                  <option value="">Select Item...</option>
                  {jewellery.map((j) => (
                    <option key={j._id} value={j._id}>{j.name} ({j.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Quantity</label>
                <div className="relative">
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min="1"
                    max={form.jewelleryId ? jewellery.find(j => j._id === form.jewelleryId)?.quantity || 1 : 1}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#d4af37] outline-none"
                  />
                  {form.jewelleryId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available: {jewellery.find(j => j._id === form.jewelleryId)?.quantity || 0} units
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Locker ID</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    name="lockerNumber"
                    value={form.lockerNumber}
                    onChange={handleChange}
                    placeholder="e.g. L-104"
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Inspection Result</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, result: "matched" })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all ${
                      form.result === "matched"
                        ? "bg-green-500/20 border-green-500 text-green-400"
                        : "bg-black/50 border-white/10 text-gray-400 hover:bg-white/5"
                    }`}
                  >
                    <CheckCircle size={14} /> MATCHED
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, result: "mismatch" })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all ${
                      form.result === "mismatch"
                        ? "bg-red-500/20 border-red-500 text-red-400"
                        : "bg-black/50 border-white/10 text-gray-400 hover:bg-white/5"
                    }`}
                  >
                    <AlertTriangle size={14} /> MISMATCH
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {form.result === "mismatch" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="text-xs font-bold text-red-400 uppercase mb-1 block">Mismatch Reason</label>
                    <input
                      name="mismatchReason"
                      value={form.mismatchReason}
                      onChange={handleChange}
                      placeholder="e.g., Weight difference, Scratch found"
                      className="w-full bg-red-500/5 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Security observations..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#d4af37] outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Proof Image</label>
                <div className="relative border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-[#d4af37]/50 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="Preview" className="h-32 mx-auto rounded-lg object-cover border border-white/10" />
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); setPreview(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Camera size={24} />
                      <span className="text-xs">Click to upload photo</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest hover:bg-[#f5d040] shadow-lg shadow-[#d4af37]/20 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} /> Verify & Log
              </button>
            </form>
          </div>
        </div>

        {/* --- RIGHT: Logs Table --- */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-gray-400" />
                History Log
              </h3>
              <button 
                onClick={loadLogs} 
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                title="Refresh"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/5">
                    <th className="p-5 font-bold pl-6">Item / Locker</th>
                    <th className="p-5 font-bold">Status</th>
                    <th className="p-5 font-bold">Verification</th>
                    <th className="p-5 font-bold text-right pr-6">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={4} className="p-10 text-center text-gray-500">Loading logs...</td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan={4} className="p-10 text-center text-gray-500">No verification logs found for this stage.</td></tr>
                  ) : (
                    <AnimatePresence>
                      {logs.map((log, index) => (
                        <motion.tr 
                          key={log._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="p-5 pl-6">
                            <div>
                              <p className="font-bold text-white text-sm">
                                {log.jewelleryId?.name || "Unknown Item"}
                              </p>
                              <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                                <Lock size={10} /> {log.lockerNumber}
                              </p>
                            </div>
                          </td>

                          <td className="p-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                              log.result === "mismatch"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-green-500/10 text-green-400 border-green-500/20"
                            }`}>
                              {log.result === "mismatch" ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                              {log.result}
                            </span>
                            {log.result === "mismatch" && (
                              <p className="text-xs text-red-400/80 mt-1 max-w-[150px] truncate" title={log.mismatchReason}>
                                {log.mismatchReason}
                              </p>
                            )}
                          </td>

                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              {log.proofImage ? (
                                <img 
                                  src={log.proofImage} 
                                  alt="Proof" 
                                  className="w-10 h-10 rounded-lg object-cover border border-white/10 cursor-pointer hover:border-[#d4af37]"
                                  onClick={() => window.open(log.proofImage, "_blank")} 
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 text-[10px]">
                                  No Img
                                </div>
                              )}
                              <div className="text-xs text-gray-400">
                                <p className="mb-0.5">By: {log.verifiedBy?.name || "Admin"}</p>
                                {log.notes && <p className="text-gray-500 italic truncate max-w-[120px]">"{log.notes}"</p>}
                              </div>
                            </div>
                          </td>

                          <td className="p-5 text-right pr-6">
                            <p className="text-xs text-gray-300 font-medium">
                              {format(new Date(log.createdAt), "MMM d")}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {format(new Date(log.createdAt), "h:mm a")}
                            </p>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}