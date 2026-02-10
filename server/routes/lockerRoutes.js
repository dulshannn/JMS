import express from "express";
import LockerVerification from "../models/LockerVerification.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Get Verification Logs (Filtered by Stage)
// @route   GET /api/locker
// @access  Private (Admin Only)
router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const { stage } = req.query;
    // Build query object if stage is provided
    const query = stage ? { stage } : {};

    const logs = await LockerVerification.find(query)
      .populate("jewelleryId", "name type") // Get item name
      .populate("verifiedBy", "name email") // Get admin who verified
      .sort({ createdAt: -1 }); // Newest first

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
});

// @desc    Create Verification Log
// @route   POST /api/locker
// @access  Private (Admin Only)
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const { 
      jewelleryId, 
      lockerNumber, 
      stage, 
      result, 
      notes, 
      mismatchReason, 
      proofImage 
    } = req.body;

    // Validation
    if (!jewelleryId || !lockerNumber) {
      return res.status(400).json({ message: "Jewellery and Locker Number are required" });
    }

    const newLog = await LockerVerification.create({
      jewelleryId,
      lockerNumber,
      stage,
      result,
      notes,
      mismatchReason,
      proofImage, // Saves the Base64 string sent from frontend
      verifiedBy: req.user._id,
    });

    res.status(201).json(newLog);
  } catch (error) {
    res.status(400).json({ message: "Validation Failed: " + error.message });
  }
});

export default router;