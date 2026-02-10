import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import uploadInvoice from "../middleware/uploadInvoice.js";

import {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
} from "../controllers/deliveryController.js";

const router = express.Router();

/**
 * ✅ ADMIN ONLY
 */
router.get("/", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  getDeliveries(req, res, next);
});

router.get("/:id", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  getDeliveryById(req, res, next);
});

router.post(
  "/",
  protect,
  uploadInvoice.single("invoice"), // ✅ must match frontend key
  async (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    createDelivery(req, res, next);
  }
);

router.put(
  "/:id",
  protect,
  uploadInvoice.single("invoice"),
  async (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    updateDelivery(req, res, next);
  }
);

router.delete("/:id", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  deleteDelivery(req, res, next);
});

export default router;
