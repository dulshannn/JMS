import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected");

    const email = "admin@sjm.com";
    const password = "Admin@123";

    const exists = await User.findOne({ email });
    if (exists) {
      console.log("⚠️ User already exists:", email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name: "Admin User",
      email,
      password: hashed,
    });

    console.log("✅ Test user created");
    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);
  } catch (err) {
    console.log("❌ Error:", err.message);
    process.exit(1);
  }
};

run();
