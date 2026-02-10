import express from "express";
import { protect } from "../middlewares/authMiddleware.js";

import {
  getUsers,
  addUser,
  updateRole,
  toggleActive,
} from "../controllers/adminUserController.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  getUsers(req, res, next);
});

router.post("/", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  addUser(req, res, next);
});

router.put("/:id/role", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  updateRole(req, res, next);
});

router.put("/:id/toggle-active", protect, async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  toggleActive(req, res, next);
});

export default router;
