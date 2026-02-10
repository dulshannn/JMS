import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

export default function CustomerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/customers/${id}`);
      const c = res.data?.data || res.data;
      setForm({
        name: c?.name || "",
        email: c?.email || "",
        phone: c?.phone || "",
        status: c?.status || "active",
        password: "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load customer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) loadCustomer();
    // eslint-disable-next-line
  }, [id]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name is required");
    if (!isEdit && !form.password.trim()) return setError("Password is required for new customer");

    try {
      setLoading(true);

      if (isEdit) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await API.put(`/api/customers/${id}`, payload);
      } else {
        await API.post("/api/customers", form);
      }

      navigate("/customers");
    } catch (err) {
      setError(err?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? "Edit Customer" : "Add Customer"} subtitle="Customer account form">
      <div className="max-w-xl">
        {error && <p className="text-red-400 mb-4">{error}</p>}

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Name"
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="Email"
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="Phone"
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
          />

          <select
            name="status"
            value={form.status}
            onChange={onChange}
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder={isEdit ? "New password (optional)" : "Password"}
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
          />

          <div className="flex gap-3 justify-end pt-2">
            <Link
              to="/customers"
              className="px-4 py-2 rounded-lg border border-gray-500 text-gray-200 hover:bg-white/10"
            >
              Cancel
            </Link>
            <button
              disabled={loading}
              className="bg-[#d4af37] text-black font-semibold px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
