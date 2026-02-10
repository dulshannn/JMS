import Order from "../models/Order.js";
import jwt from "jsonwebtoken";

// ✅ POST /api/ai-orders
export const createAiOrder = async (req, res) => {
  try {
      const userId = req.user._id;
      const { design, totalPrice, shippingAddress, customDetails } = req.body;

      if (!design || !totalPrice) {
          console.error("Missing fields:", req.body);
          return res.status(400).json({ success: false, error: "Missing design ID or price." });
      }

      const newOrder = await Order.create({
          user: userId,
          design,
          totalPrice,
          shippingAddress: shippingAddress || { city: "Matale", country: "Sri Lanka" },
          customDetails: customDetails || { size: "Standard", notes: "None" },
          status: "Pending",
          paymentMethod: "Card",
          isPaid: true
      });

      console.log(`✅ Order Placed: ${newOrder.orderNumber}`);
      res.status(201).json({ success: true, data: newOrder });

  } catch (e) {
      console.error("❌ Order Error:", e.message);
      res.status(500).json({ success: false, error: e.message });
  }
};


// ✅ GET /api/ai-orders/my
export const getMyAiOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).populate('design').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.error("❌ My Orders Error:", e.message);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};
