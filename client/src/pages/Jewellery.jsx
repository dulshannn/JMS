import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gem, Search, Plus, Edit, Trash2, X, Save, 
  DollarSign, Scale, Tag, FileText, Package 
} from "lucide-react";
import { toast } from "react-hot-toast";

import API from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

export default function Jewellery() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    type: "",
    weight: "",
    quantity: 1,
    price: "",
    description: "",
  });

  // Fetch Data
  const fetchJewellery = async () => {
    try {
      setLoading(true);
      const res = await API.get("/jewellery", { params: { search } });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setItems(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load jewellery catalog");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchJewellery(), 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [search]);

  // Modal Handlers
  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", type: "", weight: "", quantity: 1, price: "", description: "" });
    setOpenModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || "",
      type: item.type || "",
      weight: item.weight ?? "",
      quantity: item.quantity ?? 1,
      price: item.price ?? "",
      description: item.description || "",
    });
    setOpenModal(true);
  };

  const closeModal = () => setOpenModal(false);

  // Form Handlers
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Item Name is required");

    try {
      const payload = {
        ...form,
        weight: form.weight ? Number(form.weight) : undefined,
        price: form.price ? Number(form.price) : undefined,
        quantity: Number(form.quantity),
      };

      if (editing) {
        await API.put(`/jewellery/${editing._id}`, payload);
        toast.success("Item updated successfully");
      } else {
        await API.post("/jewellery", payload);
        toast.success("New item added to catalog");
      }
      closeModal();
      fetchJewellery();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this jewellery item permanently?")) return;
    try {
      await API.delete(`/jewellery/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success("Item deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <AdminLayout 
      title="Jewellery Catalog" 
      subtitle="Manage your product inventory and details."
    >
      {/* --- Toolbar --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-start md:items-center">
        <div className="relative flex-1 w-full md:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, type or code..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-600"
          />
        </div>

        <button 
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#d4af37] text-black px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-[#f5d040] shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Add Item</span>
        </button>
      </div>

      {/* --- Table --- */}
      <div className="bg-gray-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/5">
                <th className="p-5 font-bold pl-8">Product Info</th>
                <th className="p-5 font-bold">Details</th>
                <th className="p-5 font-bold">Stock</th>
                <th className="p-5 font-bold">Price (LKR)</th>
                <th className="p-5 font-bold text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500">Loading catalog...</td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Gem size={32} strokeWidth={1.5} className="mb-3 opacity-50" />
                      <p>No jewellery items found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.tr 
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-5 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-[#d4af37] border border-white/5">
                            <Gem size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{item.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.type || "General"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Scale size={14} className="text-gray-500" />
                          {item.weight ? `${item.weight}g` : "-"}
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Package size={14} className="text-gray-500" />
                          {item.quantity ?? 0}
                        </div>
                      </td>

                      <td className="p-5 font-mono text-[#d4af37] text-sm">
                        {item.price ? item.price.toLocaleString() : "-"}
                      </td>

                      <td className="p-5 text-right pr-8">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Add/Edit Modal --- */}
      <AnimatePresence>
        {openModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0a0a0a] border border-[#d4af37]/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {editing ? <Edit size={18} className="text-[#d4af37]" /> : <Plus size={18} className="text-[#d4af37]" />}
                  {editing ? "Edit Item Details" : "Add New Item"}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Item Name</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input 
                        name="name" 
                        value={form.name} 
                        onChange={handleChange} 
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#d4af37] outline-none transition-all"
                        placeholder="e.g., Gold Diamond Ring"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Type</label>
                    <select 
                      name="type" 
                      value={form.type} 
                      onChange={handleChange} 
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#d4af37] outline-none appearance-none"
                    >
                      <option value="">Select Type...</option>
                      <option value="Ring">Ring</option>
                      <option value="Chain">Chain</option>
                      <option value="Necklace">Necklace</option>
                      <option value="Bangle">Bangle</option>
                      <option value="Earring">Earring</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Weight (g)</label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input 
                        type="number" 
                        name="weight" 
                        value={form.weight} 
                        onChange={handleChange} 
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#d4af37] outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Price (LKR)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input 
                        type="number" 
                        name="price" 
                        value={form.price} 
                        onChange={handleChange} 
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#d4af37] outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Quantity</label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input 
                        type="number" 
                        name="quantity" 
                        value={form.quantity} 
                        onChange={handleChange} 
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#d4af37] outline-none transition-all"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-gray-500" size={16} />
                      <textarea 
                        name="description" 
                        value={form.description} 
                        onChange={handleChange} 
                        rows="3"
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#d4af37] outline-none transition-all resize-none"
                        placeholder="Add details about purity, stone, etc."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-bold text-sm hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 rounded-xl bg-[#d4af37] text-black font-bold text-sm hover:bg-[#f5d040] shadow-lg shadow-[#d4af37]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Save Item
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}