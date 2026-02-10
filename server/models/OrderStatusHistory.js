import mongoose from "mongoose";

const orderStatusHistorySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomOrder",
      required: true,
      index: true,
    },

    status: {
      type: String,
      required: true,
      trim: true,
    },

    comment: { type: String, default: "", trim: true },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model("OrderStatusHistory", orderStatusHistorySchema);
