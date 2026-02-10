import mongoose from "mongoose";

const lockerVerificationSchema = new mongoose.Schema(
  {
    jewelleryId: { type: mongoose.Schema.Types.ObjectId, ref: "Jewellery", required: true },
    lockerNumber: { type: String, required: true },

    stage: { type: String, enum: ["before", "after"], required: true },

    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    proofImage: { type: String, default: "" },
    notes: { type: String, default: "" },

    result: { type: String, enum: ["matched", "mismatch"], default: "matched" },
    mismatchReason: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("LockerVerification", lockerVerificationSchema);
