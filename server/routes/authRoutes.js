import express from "express";
import {
  loginUser,
  sendOtp,
  verifyOtp,
  registerCustomer,
  getMe,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Auth flow
router.post("/register", registerCustomer);
router.get("/register", (req, res) => {
  res.status(405).json({ message: "GET method not allowed. Please use POST to register." });
});
router.post("/login", loginUser);
router.get("/login", (req, res) => {
  res.status(405).json({ message: "GET method not allowed. Please use POST to login." });
});
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// ✅ Profile endpoint 
// This will respond to BOTH /api/auth/me and /api/users/me (due to server.js mapping)
router.get("/me", protect, getMe);

export default router;