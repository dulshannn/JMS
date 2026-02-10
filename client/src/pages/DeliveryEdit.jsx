import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

export default function DeliveryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [invoiceFile, setInvoiceFile] = useState(null);

  const [form, setForm] = useState({
    supplierId: "",
    itemName: "",
    quantity: 1,
    date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSuppliers = async () => {
    try {
      const res = await API.get("/api/suppliers", { params: { search: "" } });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setSuppliers(list);
    } catch {
      setSuppliers([]);
    }
  };

  const loadDelivery = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/deliveries/${id}`);
      const d = res.data?.data || res.data;

      setForm({
        supplierId: d?.supplier?._id || d?.supplierId || "",
        itemName: d?.itemName || "",
        quantity: d?.quantity ?? 1,
        date: d?.date ? String(d.date).slice(0, 10) : "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load delivery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
    loadDelivery();
    // eslint-disable-next-line
  }, [id]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.supplierId) return setError("Supplier is required");
    if (!form.itemName.trim()) return setError("Item name is required");

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("supplierId", form.supplierId);
      fd.append("itemName", form.itemName);
      fd.append("quantity", String(form.quantity));
      if (form.date) fd.append("date", form.date);
      if (invoiceFile) fd.append("invoice", invoiceFile);

      await API.put(`/api/deliveries/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/deliveries");
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Edit Delivery" subtitle="Update delivery record">
      <div className="max-w-xl">
        {error && <p className="text-red-400 mb-4">{error}</p>}

        <form onSubmit={onSubmit} className="space-y-4">
          <select
            name="supplierId"
            value={form.supplierId}
            onChange={onChange}
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            name="itemName"
            value={form.itemName}
            onChange={onChange}
            placeholder="Item Name"
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
          />

          <input
            name="quantity"
            type="number"
            min={1}
            value={form.quantity}
            onChange={onChange}
            placeholder="Quantity"
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
          />

          <input
            name="date"
            type="date"
            value={form.date}
            onChange={onChange}
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
          />

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Replace Invoice (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              to="/deliveries"
              className="px-4 py-2 rounded-lg border border-gray-500 text-gray-200 hover:bg-white/10"
            >
              Cancel
            </Link>
            <button
              disabled={loading}
              className="bg-[#d4af37] text-black font-semibold px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
