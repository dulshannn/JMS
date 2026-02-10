import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { generateDesign, getHistory } from "../controllers/designController.js";

const router = express.Router();

router.post("/generate", protect, generateDesign);
router.get("/history", getHistory); // Optional: Add 'protect' if history should be private

export default router;