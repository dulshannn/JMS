import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api.js";

export default function JewelleryForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    type: "",
    weight: 0,
    quantity: 1,
    price: 0,
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Jewellery name is required");
      return;
    }

    try {
      setLoading(true);
      await API.post("/api/jewellery", form);
      navigate("/jewellery");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add jewellery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-xl mx-auto bg-white/5 border border-[#d4af37]/20 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-[#d4af37] mb-6">Add Jewellery</h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jewellery Name"
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30"
          />

          <input
            name="type"
            value={form.type}
            onChange={handleChange}
            placeholder="Type (Ring, Chain, etc)"
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30"
          />

          <input
            type="number"
            name="weight"
            value={form.weight}
            onChange={handleChange}
            placeholder="Weight"
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30"
          />

          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30"
          />

          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30"
          />

          <div className="flex justify-between items-center pt-4">
            <Link
              to="/jewellery"
              className="px-4 py-2 rounded-lg border border-gray-500 text-gray-200 hover:bg-white/10"
            >
              Cancel
            </Link>

            <button
              disabled={loading}
              className="bg-[#d4af37] text-black font-semibold px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Add Jewellery"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
