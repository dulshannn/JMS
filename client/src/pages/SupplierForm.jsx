import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import API from "../utils/api";

export default function SupplierForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // If ID exists, we are in EDIT mode
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    category: "Raw Gold", // Default
    address: "",
    password: "", // Only required for new users
    status: "active"
  });

  const categories = [
    "Raw Gold",
    "Gemstones",
    "Diamonds",
    "Packaging",
    "Machinery",
    "Chemicals",
    "Logistics"
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchSupplier();
    }
  }, [id]);

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/suppliers/${id}`);
      // Don't populate password on edit for security
      const { password, ...dataWithoutPassword } = res.data; 
      setFormData({ ...dataWithoutPassword, password: "" });
    } catch (error) {
      toast.error("Failed to fetch supplier details");
      navigate("/suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        // Update existing
        await API.put(`/api/suppliers/${id}`, formData);
        toast.success("Supplier updated successfully");
      } else {
        // Create new
        await API.post("/api/suppliers", formData);
        toast.success("New Supplier account created");
      }
      navigate("/suppliers");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/suppliers" className="text-gray-500 hover:text-[#d4af37] text-sm flex items-center gap-2 mb-2 transition-colors">
              <i className="fas fa-arrow-left"></i> Back to List
            </Link>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Edit Partner Profile" : "Onboard New Partner"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {isEditMode ? "Update contact details and supply categories." : "Create a new supplier account for the SJM Network."}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
            
            {/* Section 1: Account Credentials */}
            <div>
              <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                <i className="fas fa-shield-alt mr-2"></i> Account Access
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Supplier Email (Login ID)</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isEditMode} // Prevent changing email on edit to avoid ID conflicts
                    className={`w-full bg-black/40 border ${isEditMode ? 'border-gray-800 text-gray-500 cursor-not-allowed' : 'border-white/10 focus:border-[#d4af37]'} rounded-xl px-4 py-3 outline-none transition-all`}
                    placeholder="contact@company.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    {isEditMode ? "New Password (Optional)" : "Initial Password"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    required={!isEditMode} // Required only for new users
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 focus:border-[#d4af37] rounded-xl px-4 py-3 outline-none transition-all"
                    placeholder={isEditMode ? "Leave blank to keep current" : "Create strong password"}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Business Details */}
            <div>
              <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                <i className="fas fa-briefcase mr-2"></i> Business Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 focus:border-[#d4af37] rounded-xl px-4 py-3 outline-none transition-all"
                    placeholder="Vertex Gold Ltd"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Contact Person Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 focus:border-[#d4af37] rounded-xl px-4 py-3 outline-none transition-all"
                    placeholder="Mr. Dulshan Kokila"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Primary Supply Category</label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 focus:border-[#d4af37] rounded-xl px-4 py-3 outline-none appearance-none transition-all text-gray-300"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"></i>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 focus:border-[#d4af37] rounded-xl px-4 py-3 outline-none transition-all"
                    placeholder="+94 7X XXX XXXX"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Business Address</label>
                  <textarea
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 focus:border-[#d4af37] rounded-xl px-4 py-3 outline-none transition-all resize-none"
                    placeholder="Enter full physical address..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
              <Link 
                to="/suppliers"
                className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-black font-bold uppercase text-xs tracking-widest hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
              >
                {loading && <i className="fas fa-spinner fa-spin"></i>}
                {isEditMode ? "Update Supplier" : "Create Account"}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}