import express from "express";
import Jewellery from "../models/Jewellery.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Get all jewellery (with Search)
// @route   GET /api/jewellery
// @access  Private (Admin & Manager)
router.get("/", protect, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // Search Logic
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sort by newest first
    const items = await Jewellery.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
});

// @desc    Get Single Jewellery by ID
// @route   GET /api/jewellery/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const item = await Jewellery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Jewellery not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new jewellery
// @route   POST /api/jewellery
// @access  Admin/Manager Only
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: "Admin/Manager access required" });
    }
    
    const newItem = await Jewellery.create({
      ...req.body,
      createdBy: req.user._id, // Tracks who added it
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: "Invalid Data: " + error.message });
  }
});

// @desc    Update jewellery
// @route   PUT /api/jewellery/:id
// @access  Admin/Manager Only
router.put("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: "Admin/Manager access required" });
    }
    
    const updatedItem = await Jewellery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedItem) return res.status(404).json({ message: "Item not found" });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: "Update Failed: " + error.message });
  }
});

// @desc    Delete jewellery
// @route   DELETE /api/jewellery/:id
// @access  Admin/Manager Only
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: "Admin/Manager access required" });
    }
    
    const item = await Jewellery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Jewellery deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete Failed: " + error.message });
  }
});

export default router;