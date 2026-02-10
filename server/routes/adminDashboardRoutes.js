import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getRecentActivities,
  getRecentOrders,
  getNotifications
} from "../controllers/adminDashboardController.js";

const router = express.Router();

// Apply admin protection to all routes
router.use(protect);
router.use(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
});

// Dashboard statistics
router.get("/stats", getDashboardStats);

// Recent activities
router.get("/activities", getRecentActivities);

// Recent orders
router.get("/orders/recent", getRecentOrders);

// Notifications
router.get("/notifications", getNotifications);

export default router;
