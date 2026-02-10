import bcrypt from "bcryptjs";
import User from "../models/User.js";

// GET /api/users/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -otp");
    return res.status(200).json({ data: user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/users (admin)
export const listUsers = async (req, res) => {
  try {
    const q = (req.query.search || "").trim();
    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { role: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(filter)
      .select("-password -otp")
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: users });
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/users (admin) -> create admin or customer user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "customer", isActive = true } =
      req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    if (!["admin", "customer"].includes(role)) {
      return res.status(400).json({ message: "Role must be admin or customer" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role,
      isActive,
      otpVerified: false,
      otp: null,
      otpExpires: null,
    });

    return res.status(201).json({
      message: "User created",
      data: { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (err) {
    console.error("createUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/:id/role (admin)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (!["admin", "customer"].includes(role)) {
      return res.status(400).json({ message: "Role must be admin or customer" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password -otp");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "Role updated", data: user });
  } catch (err) {
    console.error("updateUserRole error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/:id/toggle-active (admin)
export const toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password -otp");
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    return res
      .status(200)
      .json({ message: "User status updated", data: user });
  } catch (err) {
    console.error("toggleUserActive error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
