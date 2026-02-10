import Order from "../models/Order.js";
import User from "../models/User.js"; // Required for Aggregation
import mongoose from "mongoose";

// @desc    Create new AI Design Order
// @route   POST /api/orders/ai
// @access  Private
export const createAIOrder = async (req, res) => {
  try {
    const { 
      design, 
      totalPrice, 
      shippingAddress, 
      customDetails, 
      paymentMethod, 
      isPaid 
    } = req.body;

    if (!design || !totalPrice || !shippingAddress) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields (design, price, or address)" 
      });
    }

    // Generate Secure Random Order ID (e.g. ORD-829103)
    const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);

    const newOrder = new Order({
      user: req.user._id, 
      design,
      orderNumber,
      totalPrice,
      shippingAddress: {
        addressLine: shippingAddress.addressLine || "Matale City",
        city: shippingAddress.city,
        country: shippingAddress.country
      },
      customDetails: {
        size: customDetails?.size || "Standard",
        metalType: customDetails?.metalType || "22K Gold",
        notes: customDetails?.notes || "None"
      },
      paymentMethod: paymentMethod || "Card",
      isPaid: isPaid === true,
      paidAt: isPaid ? Date.now() : null,
      status: "Pending"
    });

    const savedOrder = await newOrder.save();
    console.log(`✅ Order ${orderNumber} created successfully`);

    res.status(201).json({
      success: true,
      data: savedOrder
    });

  } catch (error) {
    console.error("❌ Create Order Error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Server Error: Could not place order." 
    });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("design", "title image") 
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error("❌ Get Orders Error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Server Error: Could not fetch orders." 
    });
  }
};

// @desc    Get all orders with ADVANCED SEARCH (Name, Email, ID)
// @route   GET /api/orders
// @access  Private (Admin/Manager)
export const getAllOrders = async (req, res) => {
  try {
    const { search, status } = req.query;

    const pipeline = [];

    // 1. LOOKUP: Join Users collection to get Customer Name & Email
    pipeline.push({
      $lookup: {
        from: "users", // Must match MongoDB collection name (lowercase plural)
        localField: "user",
        foreignField: "_id",
        as: "customerDetails"
      }
    });

    // 2. UNWIND: Convert array to object
    pipeline.push({ $unwind: "$customerDetails" });

    // 3. LOOKUP: Join Designs collection (optional details)
    pipeline.push({
      $lookup: {
        from: "designs",
        localField: "design",
        foreignField: "_id",
        as: "designDetails"
      }
    });

    // Preserve order if design is missing
    pipeline.push({ 
      $unwind: { path: "$designDetails", preserveNullAndEmptyArrays: true } 
    });

    // 4. MATCH: Advanced Search Logic
    const matchStage = {};

    // Status Filter (Exact Match)
    if (status && status !== 'all') {
      matchStage.status = status.charAt(0).toUpperCase() + status.slice(1);
    }

    // Search Filter (Regex across multiple fields)
    if (search) {
      const regex = new RegExp(search, 'i'); // Case-insensitive
      matchStage.$or = [
        { orderNumber: regex },
        { "customerDetails.name": regex },
        { "customerDetails.email": regex },
        { "customDetails.notes": regex }
      ];
    }

    pipeline.push({ $match: matchStage });

    // 5. SORT: Newest first
    pipeline.push({ $sort: { createdAt: -1 } });

    // 6. PROJECT: Security (Hide passwords)
    pipeline.push({
      $project: {
        "customerDetails.password": 0,
        "customerDetails.__v": 0
      }
    });

    const orders = await Order.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error("❌ Get All Orders Error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Server Error: Could not fetch orders." 
    });
  }
};

// @desc    Approve order
// @route   PUT /api/orders/:id/approve
// @access  Private (Admin/Manager)
export const approveOrder = async (req, res) => {
  try {
    const { managerComment } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status: "Approved", // Consistent Enum Value
        managerComment: managerComment || ""
      },
      { new: true }
    ).populate('user', 'name email').populate('design', 'title');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ 
      success: true,
      message: "Order approved successfully", 
      data: order 
    });
  } catch (error) {
    console.error("❌ Approve Order Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Reject order
// @route   PUT /api/orders/:id/reject
// @access  Private (Admin/Manager)
export const rejectOrder = async (req, res) => {
  try {
    const { managerComment } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status: "Rejected", // Consistent Enum Value
        managerComment: managerComment || ""
      },
      { new: true }
    ).populate('user', 'name email').populate('design', 'title');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ 
      success: true,
      message: "Order rejected successfully", 
      data: order 
    });
  } catch (error) {
    console.error("❌ Reject Order Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Manager)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    
    // Ensure capitalization matches Enum (e.g. "pending" -> "Pending")
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status: formattedStatus,
        managerComment: comment || ""
      },
      { new: true }
    ).populate('user', 'name email').populate('design', 'title');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ 
      success: true,
      message: `Order status updated to ${formattedStatus}`, 
      data: order 
    });
  } catch (error) {
    console.error("❌ Update Status Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get approved orders for supplier production
// @route   GET /api/orders/approved
// @access  Private (Supplier only)
export const getApprovedOrdersForSupplier = async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: { $in: ["Processing", "Approved"] } // Fetch both relevant statuses
    })
      .populate('user', 'name email')
      .populate('design', 'title image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error("❌ Get Approved Orders Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};