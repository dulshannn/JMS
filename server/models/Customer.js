import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true },

    phone: { type: String, default: "" },
    address: { type: String, default: "" },

    status: { type: String, enum: ["active", "blocked"], default: "active" },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
