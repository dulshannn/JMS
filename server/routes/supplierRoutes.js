import express from "express";
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Admin-only supplier CRUD
router.get("/", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  getSuppliers(req, res, next);
});

router.get("/:id", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  getSupplierById(req, res, next);
});

router.post("/", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  createSupplier(req, res, next);
});

router.put("/:id", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  updateSupplier(req, res, next);
});

router.delete("/:id", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  deleteSupplier(req, res, next);
});

export default router;
