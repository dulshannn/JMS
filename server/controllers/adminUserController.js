import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ data: users });
  } catch (err) {
    console.error("❌ getUsers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addUser = async (req, res) => {
  try {
    const { name, email, password, role = "customer" } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email, password required" });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role,
      isActive: true,
      otpVerified: true, // ✅ admin-created user skip OTP
    });

    res.status(201).json({
      message: "User created ✅",
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("❌ addUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) return res.status(400).json({ message: "Role required" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.status(200).json({ message: "Role updated ✅" });
  } catch (err) {
    console.error("❌ updateRole:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      message: `User ${user.isActive ? "activated" : "deactivated"} ✅`,
      isActive: user.isActive,
    });
  } catch (err) {
    console.error("❌ toggleActive:", err);
    res.status(500).json({ message: "Server error" });
  }
};
