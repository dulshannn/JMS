import mongoose from "mongoose";

const stockLogSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    quantityBefore: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },
    changeAmount: { type: Number, required: true },

    type: { type: String, default: "delivery" }, // delivery / manual

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StockLog", stockLogSchema);
