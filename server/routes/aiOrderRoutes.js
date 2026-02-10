import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createAiOrder, getMyAiOrders } from "../controllers/aiOrderController.js";

const router = express.Router();

router.post("/", protect, createAiOrder);
router.get("/my", protect, getMyAiOrders);

export default router;
