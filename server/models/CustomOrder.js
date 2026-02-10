import mongoose from "mongoose";

const customOrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true, trim: true },
    requirements: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },

    designFiles: [
      {
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // workflow
    status: {
      type: String,
      enum: [
        "requested",     // customer submitted
        "pending",       // waiting approval
        "approved",      // approved
        "rejected",      // rejected
        "in_progress",   // making
        "ready",         // ready
        "delivered",     // delivered
      ],
      default: "pending",
    },

    managerComment: { type: String, default: "", trim: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },

    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("CustomOrder", customOrderSchema);
