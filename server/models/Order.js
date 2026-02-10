import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true // Index for faster lookups
  },
  design: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Design",
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true // Index for search
  },
  totalPrice: {
    type: Number,
    required: true
  },
  // Enhanced Status Enum to match Manager Workflow
  status: {
    type: String,
    enum: [
      "Pending",      // Newly created
      "Approved",     // Manager reviewed & accepted
      "Processing",   // Manufacturing started
      "Shipped",      // Out for delivery
      "Delivered",    // Complete
      "Cancelled",    // User cancelled
      "Rejected"      // Manager denied
    ],
    default: "Pending"
  },
  shippingAddress: {
    addressLine: { type: String, default: "N/A" },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  customDetails: {
    size: { type: String, required: true },
    metalType: { type: String, default: "22K Gold" },
    notes: { type: String, default: "" }
  },
  paymentMethod: { type: String, default: "Card" },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  
  // Internal Manager Fields
  managerComment: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Order", OrderSchema);