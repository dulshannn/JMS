import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api.js";

export default function UserForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email, password are required");
      return;
    }

    try {
      setLoading(true);
      await API.post("/users", form);
      navigate("/users");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-xl mx-auto bg-white/5 border border-[#d4af37]/20 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-[#d4af37] mb-6">Add User</h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30"
          />

          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30"
          >
            <option value="customer">customer</option>
            <option value="admin">admin</option>
          </select>

          <div className="flex justify-between items-center pt-4">
            <Link
              to="/users"
              className="px-4 py-2 rounded-lg border border-gray-500 text-gray-200 hover:bg-white/10"
            >
              Cancel
            </Link>

            <button
              disabled={loading}
              className="bg-[#d4af37] text-black font-semibold px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
