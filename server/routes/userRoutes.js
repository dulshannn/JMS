import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Get current logged-in user profile
// @route   GET /api/users/me
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
});

// @desc    List all users (Admin)
// @route   GET /api/users
// @access  Private (Admin Only)
router.get("/", protect, async (req, res) => {
  try {
    // Simple admin check - in production, use proper middleware
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
});

// @desc    Create a new user (Admin)
// @route   POST /api/users
// @access  Private (Admin Only)
router.post("/", protect, async (req, res) => {
  try {
    // Simple admin check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Note: Password hashing should be handled in your User model 'pre-save' hook
    const user = await User.create({
      name,
      email,
      password, // Send raw, model should hash it
      role: role || "customer",
      isActive: true
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update User Role
// @route   PUT /api/users/:id/role
// @access  Private (Admin Only)
router.put("/:id/role", protect, async (req, res) => {
  try {
    // Simple admin check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
      user.role = role || user.role;
      const updatedUser = await user.save();
      res.json({ message: "Role updated", user: updatedUser });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Toggle User Active Status
// @route   PUT /api/users/:id/toggle-active
// @access  Private (Admin Only)
router.put("/:id/toggle-active", protect, async (req, res) => {
  try {
    // Simple admin check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const user = await User.findById(req.params.id);

    if (user) {
      user.isActive = !user.isActive;
      await user.save();
      res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}` });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;