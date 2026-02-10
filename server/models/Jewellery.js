import mongoose from "mongoose";

const jewellerySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, default: "Other" },
    weight: { type: Number, default: 0 },
    quantity: { type: Number, default: 1, min: 0 },
    price: { type: Number, default: 0 },
    description: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Jewellery", jewellerySchema);
