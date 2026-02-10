import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    // ✅ Added "manager" to allowed roles
    role: {
      type: String,
      enum: ["admin", "customer", "supplier", "manager"], 
      default: "customer",
    },

    // Optional Profile Fields
    phone: { type: String, default: "" },
    companyName: { type: String, default: "" },
    category: { type: String, default: "" },
    address: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // OTP & Security
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);