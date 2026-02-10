import express from "express";
// 👇 This path must match exactly where you created the file
import { protect } from "../middleware/authMiddleware.js"; 
import { 
  createAIOrder, 
  getMyOrders, 
  getAllOrders, 
  approveOrder, 
  rejectOrder, 
  updateOrderStatus,
  getApprovedOrdersForSupplier
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/ai", protect, createAIOrder);
router.get("/my", protect, getMyOrders);

// Supplier route to get approved orders for production
router.get("/approved", protect, async (req, res, next) => {
  if (!['supplier'].includes(req.user.role)) {
    return res.status(403).json({ message: "Supplier access required" });
  }
  getApprovedOrdersForSupplier(req, res, next);
});

// Admin/Manager order management routes
router.get("/", protect, async (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin or Manager access required" });
  }
  getAllOrders(req, res, next);
});

router.put("/:id/approve", protect, async (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin or Manager access required" });
  }
  approveOrder(req, res, next);
});

router.put("/:id/reject", protect, async (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin or Manager access required" });
  }
  rejectOrder(req, res, next);
});

router.put("/:id/status", protect, async (req, res, next) => {
  if (!['admin', 'manager', 'supplier'].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin, Manager, or Supplier access required" });
  }
  updateOrderStatus(req, res, next);
});

export default router;