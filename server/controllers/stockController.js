import StockLog from "../models/StockLog.js";
import Delivery from "../models/Delivery.js";
import Supplier from "../models/Supplier.js";

/**
 * ✅ GET ALL STOCK SUMMARY (Admin)
 * Stock is calculated from deliveries (because you don’t have Stock.js)
 * This gives a clean list like:
 * itemName | totalQuantity
 */
export const getStock = async (req, res) => {
  try {
    const deliveries = await Delivery.find();

    const stockMap = {};

    deliveries.forEach((d) => {
      const item = d.itemName?.trim() || "Unknown Item";
      const qty = Number(d.quantity || 0);

      if (!stockMap[item]) stockMap[item] = 0;
      stockMap[item] += qty;
    });

    const stockList = Object.entries(stockMap).map(([itemName, totalQty]) => ({
      itemName,
      quantity: totalQty,
    }));

    res.json(stockList);
  } catch (err) {
    console.error("❌ getStock error:", err.message);
    res.status(500).json({ message: "Server error while loading stock" });
  }
};

/**
 * ✅ UPDATE STOCK QUANTITY (Admin)
 * Since we don’t have a Stock model, updates are logged only in StockLog
 * (Real stock comes from deliveries + manual adjustments)
 */
export const updateStockQuantity = async (req, res) => {
  try {
    const { itemName, changeAmount, type } = req.body;

    if (!itemName || changeAmount === undefined) {
      return res.status(400).json({ message: "itemName and changeAmount required" });
    }

    const deliveries = await Delivery.find({ itemName });

    const totalBefore = deliveries.reduce((sum, d) => sum + Number(d.quantity || 0), 0);
    const totalAfter = totalBefore + Number(changeAmount);

    if (totalAfter < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    // ✅ Log adjustment
    const log = await StockLog.create({
      itemName,
      quantityBefore: totalBefore,
      quantityAfter: totalAfter,
      changeAmount: Number(changeAmount),
      type: type || "manual",
      updatedBy: req.user._id,
    });

    res.json({
      message: "Stock updated successfully",
      before: totalBefore,
      after: totalAfter,
      log,
    });
  } catch (err) {
    console.error("❌ updateStockQuantity error:", err.message);
    res.status(500).json({ message: "Server error while updating stock" });
  }
};

/**
 * ✅ GET ALL STOCK LOGS (Admin)
 */
export const getStockLogs = async (req, res) => {
  try {
    const logs = await StockLog.find()
      .sort({ createdAt: -1 })
      .populate("updatedBy", "name email");

    res.json(logs);
  } catch (err) {
    console.error("❌ getStockLogs error:", err.message);
    res.status(500).json({ message: "Server error while loading stock logs" });
  }
};
