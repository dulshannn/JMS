import React, { useEffect, useState } from "react";
import API from "../utils/api.js";
import AdminLayout from "../components/AdminLayout.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // add user modal
  const [openAdd, setOpenAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "customer" });

  // edit role modal
  const [openRole, setOpenRole] = useState(false);
  const [roleUser, setRoleUser] = useState(null);
  const [newRole, setNewRole] = useState("customer");

  // toggle confirm
  const [toggleUser, setToggleUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/users");
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setUsers(list);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    setError("");
    if (!addForm.name.trim()) return setError("Name required");
    if (!addForm.email.trim()) return setError("Email required");
    if (!addForm.password.trim()) return setError("Password required");

    try {
      await API.post("/users", addForm);
      setOpenAdd(false);
      setAddForm({ name: "", email: "", password: "", role: "customer" });
      fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Create user failed");
    }
  };

  const openEditRole = (u) => {
    setRoleUser(u);
    setNewRole(u.role || "customer");
    setOpenRole(true);
  };

  const saveRole = async () => {
    try {
      await API.put(`/api/users/${roleUser._id}/role`, { role: newRole });
      setOpenRole(false);
      setRoleUser(null);
      fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Update role failed");
    }
  };

  const confirmToggle = async () => {
    try {
      await API.put(`/api/users/${toggleUser._id}/active`, { isActive: !toggleUser.isActive });
      setToggleUser(null);
      fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Toggle failed");
    }
  };

  return (
    <AdminLayout title="User Management" subtitle="Create users, change roles, activate/deactivate">
      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="flex justify-between mb-6">
        <button
          onClick={() => setOpenAdd(true)}
          className="bg-[#d4af37] text-black font-semibold px-4 py-2 rounded-lg hover:opacity-90"
        >
          + Add User
        </button>

        <button
          onClick={fetchUsers}
          className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading users...</p>
      ) : (
        <div className="overflow-x-auto bg-black/30 border border-white/10 rounded-xl">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[#d4af37] border-b border-white/10">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Active</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length ? (
                users.map((u) => (
                  <tr key={u._id} className="border-b border-white/5">
                    <td className="p-4">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-white/10">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          u.isActive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => openEditRole(u)}
                        className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-200 hover:bg-blue-500/30"
                      >
                        Edit Role
                      </button>

                      <button
                        onClick={() => setToggleUser(u)}
                        className="px-3 py-1 rounded-lg bg-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/30"
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-gray-400">
                    No users.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add user modal */}
      {openAdd && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-[#111] border border-[#d4af37]/30 rounded-2xl p-6 w-full max-w-xl">
            <h2 className="text-xl font-bold text-[#d4af37] mb-4">Add User</h2>

            <form onSubmit={createUser} className="space-y-3">
              <input
                value={addForm.name}
                onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Name"
                className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
              />
              <input
                value={addForm.email}
                onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email"
                type="email"
                className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
              />
              <input
                value={addForm.password}
                onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Password"
                type="password"
                className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
              />
              <select
                value={addForm.role}
                onChange={(e) => setAddForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
              >
                <option value="customer">customer</option>
                <option value="admin">admin</option>
              </select>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenAdd(false)}
                  className="px-4 py-2 rounded-lg border border-gray-500 text-gray-200 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button className="bg-[#d4af37] text-black font-semibold px-6 py-2 rounded-lg hover:opacity-90">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit role modal */}
      {openRole && roleUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-[#111] border border-[#d4af37]/30 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[#d4af37] mb-4">Edit Role</h2>

            <p className="text-gray-300 mb-3">{roleUser.email}</p>

            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black border border-[#d4af37]/30 focus:outline-none"
            >
              <option value="customer">customer</option>
              <option value="admin">admin</option>
            </select>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setOpenRole(false)}
                className="px-4 py-2 rounded-lg border border-gray-500 text-gray-200 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={saveRole}
                className="bg-[#d4af37] text-black font-semibold px-6 py-2 rounded-lg hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(toggleUser)}
        title="Confirm Action"
        message={
          toggleUser?.isActive
            ? "Deactivate this user account?"
            : "Activate this user account?"
        }
        confirmText={toggleUser?.isActive ? "Deactivate" : "Activate"}
        onCancel={() => setToggleUser(null)}
        onConfirm={confirmToggle}
      />
    </AdminLayout>
  );
}
