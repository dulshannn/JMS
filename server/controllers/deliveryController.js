import Delivery from "../models/Delivery.js";
import Supplier from "../models/Supplier.js";
import Stock from "../models/Stock.js";
import StockLog from "../models/StockLog.js";

// ✅ CREATE DELIVERY + Auto Update Stock + Create Stock Log
export const createDelivery = async (req, res) => {
  try {
    const { supplierId, itemName, quantity, deliveryDate } = req.body;

    if (!supplierId || !itemName || !quantity) {
      return res.status(400).json({ message: "supplierId, itemName, quantity are required" });
    }

    // ✅ Validate supplier exists
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(400).json({ message: "Invalid supplierId" });
    }

    // ✅ Handle invoice upload
    const invoiceImage = req.file ? `/uploads/${req.file.filename}` : null;

    // ✅ Save delivery record
    const delivery = await Delivery.create({
      supplierId,
      itemName,
      quantity: Number(quantity),
      deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
      invoiceImage,
      createdBy: req.user?._id || null,
    });

    // ✅ Update Stock
    let stock = await Stock.findOne({ itemName });

    if (!stock) {
      stock = await Stock.create({
        itemName,
        quantity: 0,
        updatedBy: req.user?._id || null,
      });
    }

    const before = stock.quantity;
    stock.quantity = before + Number(quantity);
    stock.lastUpdated = new Date();
    stock.updatedBy = req.user?._id || null;

    await stock.save();

    // ✅ Create stock log
    await StockLog.create({
      stockId: stock._id,
      deliveryId: delivery._id,
      quantityBefore: before,
      quantityAfter: stock.quantity,
      changeAmount: Number(quantity),
      type: "delivery",
    });

    return res.status(201).json({
      message: "Delivery created & stock updated successfully",
      delivery,
      stock,
    });
  } catch (error) {
    console.error("❌ createDelivery error:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ GET ALL DELIVERIES
export const getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate("supplierId", "name email phone")
      .sort({ createdAt: -1 });

    res.json(deliveries);
  } catch (error) {
    console.error("❌ getDeliveries error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ GET DELIVERY BY ID
export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate("supplierId", "name email phone");
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    res.json(delivery);
  } catch (error) {
    console.error("❌ getDeliveryById error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ UPDATE DELIVERY (invoice optional)
export const updateDelivery = async (req, res) => {
  try {
    const { supplierId, itemName, quantity, deliveryDate } = req.body;

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    if (supplierId) {
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) return res.status(400).json({ message: "Invalid supplierId" });
      delivery.supplierId = supplierId;
    }

    if (itemName) delivery.itemName = itemName;
    if (quantity) delivery.quantity = Number(quantity);
    if (deliveryDate) delivery.deliveryDate = new Date(deliveryDate);

    // ✅ Update invoice if new file uploaded
    if (req.file) {
      delivery.invoiceImage = `/uploads/${req.file.filename}`;
    }

    await delivery.save();

    res.json({ message: "Delivery updated successfully", delivery });
  } catch (error) {
    console.error("❌ updateDelivery error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ DELETE DELIVERY
export const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    await delivery.deleteOne();
    res.json({ message: "Delivery deleted successfully" });
  } catch (error) {
    console.error("❌ deleteDelivery error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
