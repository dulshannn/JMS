import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
      unique: true, // ✅ only this is enough for index
    },

    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// ❌ REMOVE any stockSchema.index({ itemName: 1 }) if you have it.

export default mongoose.model("Stock", stockSchema);
