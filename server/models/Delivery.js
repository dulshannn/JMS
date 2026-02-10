import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    deliveryDate: { type: Date, default: Date.now },
    invoiceImage: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Delivery", deliverySchema);
