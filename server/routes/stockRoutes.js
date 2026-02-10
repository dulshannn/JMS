import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getStock,
  updateStockQuantity,
  getStockLogs,
} from "../controllers/stockController.js";

const router = express.Router();

/**
 * ✅ STOCK ROUTES
 * Base path in server.js should be:
 * app.use("/api/stock", stockRoutes);
 */

// ✅ Get stock logs (ADMIN)
router.get("/logs/all", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  getStockLogs(req, res, next);
});

// ✅ Get all stock items (ADMIN)
router.get("/", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  getStock(req, res, next);
});

// ✅ Update stock quantity (ADMIN)
router.put("/:id", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  updateStockQuantity(req, res, next);
});

export default router;
