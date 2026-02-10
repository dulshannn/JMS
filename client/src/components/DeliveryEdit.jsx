import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../utils/api.js";

export default function DeliveryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    supplierId: "",
    itemName: "",
    quantity: "",
    deliveryDate: "",
  });

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load suppliers + current delivery
  useEffect(() => {
    const load = async () => {
      try {
        const [supplierRes, deliveryRes] = await Promise.all([
          API.get("/api/suppliers"),
          API.get(`/api/deliveries/${id}`),
        ]);

        setSuppliers(supplierRes.data || []);

        const d = deliveryRes.data;

        setForm({
          supplierId: d.supplierId?._id || d.supplierId || "",
          itemName: d.itemName || "",
          quantity: d.quantity || "",
          deliveryDate: d.deliveryDate
            ? d.deliveryDate.substring(0, 10)
            : "",
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Failed to load delivery data!");
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setInvoice(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("supplierId", form.supplierId);
      data.append("itemName", form.itemName);
      data.append("quantity", form.quantity);
      data.append("deliveryDate", form.deliveryDate);

      if (invoice) data.append("invoice", invoice);

      await API.put(`/deliveries/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Delivery updated successfully!");
      navigate("/deliveries");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "❌ Failed to update delivery");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto bg-[#111] border border-[#d4af37]/20 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-[#d4af37] mb-6">
          Edit Delivery
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Supplier */}
          <div>
            <label className="block text-gray-300 mb-2">Supplier</label>
            <select
              name="supplierId"
              value={form.supplierId}
              onChange={handleChange}
              className="w-full bg-black border border-[#d4af37]/30 p-3 rounded-lg"
              required
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-gray-300 mb-2">Item Name</label>
            <input
              type="text"
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              className="w-full bg-black border border-[#d4af37]/30 p-3 rounded-lg"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-gray-300 mb-2">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="w-full bg-black border border-[#d4af37]/30 p-3 rounded-lg"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-300 mb-2">Delivery Date</label>
            <input
              type="date"
              name="deliveryDate"
              value={form.deliveryDate}
              onChange={handleChange}
              className="w-full bg-black border border-[#d4af37]/30 p-3 rounded-lg"
              required
            />
          </div>

          {/* Invoice Upload */}
          <div>
            <label className="block text-gray-300 mb-2">
              Replace Invoice (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="w-full bg-black border border-[#d4af37]/30 p-3 rounded-lg"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="bg-[#d4af37] text-black font-bold px-6 py-3 rounded-lg hover:opacity-90"
            >
              ✅ Update
            </button>

            <Link
              to="/deliveries"
              className="border border-[#d4af37] text-[#d4af37] font-semibold px-6 py-3 rounded-lg hover:bg-[#d4af37] hover:text-black"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
