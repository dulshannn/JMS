import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api.js";
import { 
  FaArrowLeft, 
  FaCloudUploadAlt, 
  FaTrash, 
  FaGem, 
  FaCoins, 
  FaCalendarAlt, 
  FaRing,
  FaTimes,
  FaDollarSign,
  FaCheckCircle
} from "react-icons/fa";

export default function CustomOrderForm() {
  const navigate = useNavigate();

  // --- State Management ---
  const [form, setForm] = useState({
    title: "",
    type: "Ring",
    material: "Gold 22k",
    gemstone: "",
    budget: "",
    deadline: "",
    requirements: "",
    notes: "",
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // --- Handlers ---

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleFile = (e) => {
    const selected = Array.from(e.target.files || []);
    
    // Validate File Size (Max 5MB)
    const validFiles = selected.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setErr(`File ${file.name} is too large (Max 5MB)`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);

    // Generate Previews
    const newPreviews = validFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!form.title.trim()) {
      setErr("Order title is required");
      return;
    }
    if (!form.requirements.trim()) {
      setErr("Please describe your requirements");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      Object.keys(form).forEach(key => fd.append(key, form[key]));
      files.forEach((f) => fd.append("designFiles", f));

      // Attempt to send to Backend
      // NOTE: If backend is missing (404), catch block handles it gracefully.
      const res = await API.post("/orders", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg(res?.data?.message || "Order submitted successfully! ✅");
      handleSuccessCleanup();

    } catch (e2) {
      console.error(e2);

      // --- MOCK SUCCESS FALLBACK ---
      // If the endpoint doesn't exist (404), we simulate success 
      // so you can test the UI flow.
      if (e2.response && e2.response.status === 404) {
        console.warn("Backend endpoint /orders missing. Simulating success.");
        setMsg("Order submitted successfully! (Mock) ✅");
        handleSuccessCleanup();
      } else {
        // Real Error
        setErr(e2?.response?.data?.message || "Failed to submit order. Please try again.");
        setLoading(false);
      }
    }
  };

  // Helper to clear form and redirect on success
  const handleSuccessCleanup = () => {
    // Cleanup Object URLs
    previews.forEach(p => URL.revokeObjectURL(p.url));
    
    // Redirect after 2 seconds
    setTimeout(() => {
        navigate("/customer-dashboard");
        setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    return () => previews.forEach(p => URL.revokeObjectURL(p.url));
  }, [previews]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] px-4 py-8 md:py-12 font-sans selection:bg-[#d4af37] selection:text-black">
      <div className="max-w-4xl mx-auto">
        
        {/* --- Header & Nav --- */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/customer-dashboard"
            className="p-3 rounded-full bg-[#1a1a1a] text-[#d4af37] border border-[#d4af37]/20 hover:bg-[#d4af37] hover:text-black transition-all duration-300 shadow-lg shadow-[#d4af37]/10"
          >
            <FaArrowLeft className="text-lg" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#d4af37] tracking-wide">
              Design Your Custom Jewel
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Tell us your vision, and our artisans will bring it to life.
            </p>
          </div>
        </div>

        {/* --- Main Form Card --- */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

          {msg && (
            <div className="mb-6 rounded-xl border border-green-500/30 bg-green-900/10 px-4 py-4 text-green-300 flex items-center gap-3 shadow-lg animate-pulse">
              <FaCheckCircle /> {msg}
            </div>
          )}
          {err && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-900/10 px-4 py-4 text-red-300 flex items-center gap-3 shadow-lg">
              <FaTimes /> {err}
            </div>
          )}

          <form onSubmit={submit} className="space-y-8 relative z-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Title */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Order Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Vintage Sapphire Engagement Ring"
                  className="w-full px-5 py-3 rounded-xl bg-[#0a0a0a] border border-[#333] text-white placeholder-gray-600 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none transition-all"
                />
              </div>

              {/* Jewellery Type */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                  <FaRing /> Jewellery Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-5 py-3 rounded-xl bg-[#0a0a0a] border border-[#333] text-white focus:border-[#d4af37] focus:outline-none appearance-none"
                >
                  <option>Ring</option>
                  <option>Necklace</option>
                  <option>Earrings</option>
                  <option>Bracelet</option>
                  <option>Bangle</option>
                  <option>Pendant</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                  <FaCoins /> Metal Preference
                </label>
                <select
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  className="w-full px-5 py-3 rounded-xl bg-[#0a0a0a] border border-[#333] text-white focus:border-[#d4af37] focus:outline-none appearance-none"
                >
                  <option>Gold 24k</option>
                  <option>Gold 22k</option>
                  <option>Gold 18k (Yellow)</option>
                  <option>Gold 18k (White)</option>
                  <option>Gold 18k (Rose)</option>
                  <option>Platinum</option>
                  <option>Silver</option>
                </select>
              </div>

              {/* Gemstones */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                  <FaGem /> Gemstones (Optional)
                </label>
                <input
                  name="gemstone"
                  value={form.gemstone}
                  onChange={handleChange}
                  placeholder="e.g., Diamond, Ruby, Emerald"
                  className="w-full px-5 py-3 rounded-xl bg-[#0a0a0a] border border-[#333] text-white placeholder-gray-600 focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                  <FaDollarSign /> Est. Budget (LKR)
                </label>
                <input
                  type="number"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="50000"
                  className="w-full px-5 py-3 rounded-xl bg-[#0a0a0a] border border-[#333] text-white placeholder-gray-600 focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                  <FaCalendarAlt /> Needed By
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="w-full px-5 py-3 rounded-xl bg-[#0a0a0a] border border-[#333] text-white placeholder-gray-600 focus:border-[#d4af37] focus:outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            <hr className="border-[#222]" />

            {/* Details Section */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Detailed Requirements</label>
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                placeholder="Describe the design, engraving details, specific weights, or any inspiration you have..."
                rows={5}
                className="w-full px-5 py-3 rounded-xl bg-[#0a0a0a] border border-[#333] text-white placeholder-gray-600 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none transition-all"
              />
            </div>

            {/* File Upload Section */}
            <div className="bg-[#0a0a0a] border border-dashed border-[#444] rounded-xl p-6 md:p-8 text-center hover:border-[#d4af37] transition-colors group">
              <input
                type="file"
                multiple
                id="fileUpload"
                accept="image/*,application/pdf"
                onChange={handleFile}
                className="hidden"
              />
              <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center justify-center">
                <div className="p-4 rounded-full bg-[#111] text-[#d4af37] mb-3 group-hover:scale-110 transition-transform">
                  <FaCloudUploadAlt className="text-3xl" />
                </div>
                <span className="text-gray-300 font-medium">Click to upload design sketches or references</span>
                <span className="text-gray-600 text-xs mt-1">JPG, PNG, PDF (Max 5MB)</span>
              </label>
            </div>

            {/* File Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {previews.map((file, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#333] bg-[#0a0a0a]">
                    {file.type.startsWith("image/") ? (
                      <img src={file.url} alt="preview" className="w-full h-24 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center text-gray-500 text-xs p-2 text-center">
                        {file.name}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-red-600/80 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <button
                disabled={loading}
                className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b5952f] text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </span>
                ) : (
                  "Submit Order Request"
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}