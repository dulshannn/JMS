import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../controllers/customerController.js";

// Make sure your middleware path is correct
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// PROFILE ROUTES: Logged-in user (admin/customer/manager/supplier)
router.get("/me/profile", protect, getMyProfile);
router.put("/me/profile", protect, updateMyProfile);
router.put("/me/password", protect, changeMyPassword);

// ADMIN ONLY: Customer Management CRUD
router.get("/", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  getCustomers(req, res, next);
});

router.post("/", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  createCustomer(req, res, next);
});

router.get("/:id", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  getCustomerById(req, res, next);
});

router.put("/:id", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  updateCustomer(req, res, next);
});

router.delete("/:id", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  deleteCustomer(req, res, next);
});

export default router;