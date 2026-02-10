import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

import User from "./models/User.js";
import Jewellery from "./models/Jewellery.js";
import LockerVerification from "./models/LockerVerification.js";
import Supplier from "./models/Supplier.js"; 
import Stock from "./models/Stock.js";
import Delivery from "./models/Delivery.js";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const run = async () => {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI not found in .env");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Mongo connected for seeding");

    // 1. CLEAN DB
    await Promise.all([
      User.deleteMany({}),
      Jewellery.deleteMany({}),
      LockerVerification.deleteMany({}),
      Supplier.deleteMany({}),
      Stock.deleteMany({}),
      Delivery.deleteMany({}),
    ]);

    // 2. HASH PASSWORDS
    const adminPass = await bcrypt.hash("Admin123!", 10);
    const managerPass = await bcrypt.hash("Manager123!", 10);
    const custPass = await bcrypt.hash("Customer123!", 10);
    const suppPass = await bcrypt.hash("Supplier123!", 10);

    // 3. CREATE USERS
    // --- Admin ---
    await User.create({
      name: "Super Admin",
      email: "admin@sjm.com",
      password: adminPass,
      role: "admin",
      phone: "0771112233",
      isActive: true,
      otpVerified: true,
    });

    // --- MANAGER (NEW) ---
    await User.create({
      name: "Store Manager",
      email: "manager@sjm.com",
      password: managerPass,
      role: "manager",
      phone: "0775556666",
      isActive: true,
      otpVerified: true,
    });

    // --- Customer ---
    await User.create({
      name: "Loyal Customer",
      email: "customer@sjm.com",
      password: custPass,
      role: "customer",
      isActive: true,
      otpVerified: true,
    });

    // --- Supplier User ---
    const supplierUser = await User.create({
      name: "Vertex Gold Manager",
      email: "supplier@vertex.com",
      password: suppPass,
      role: "supplier",
      companyName: "Vertex Gold Ltd",
      category: "Raw Gold",
      phone: "0779998877",
      address: "123 Gold Street, Colombo",
      isActive: true,
      otpVerified: true,
      status: "active"
    });

    // 4. CREATE SUPPLIER DOCS
    const suppliers = await Supplier.insertMany([
      {
        name: "Vertex Gold Ltd",
        email: "supplier@vertex.com",
        phone: "0779998877",
        address: "Colombo, Sri Lanka",
        category: "Raw Gold",
        status: "active"
      },
    ]);

    // 5. JEWELLERY DATA
    await Jewellery.insertMany([
      {
        name: "Gold Ring 22K",
        type: "Ring",
        weight: 4.2,
        quantity: 5,
        price: 120000,
        description: "22K gold ring",
        createdBy: supplierUser._id,
      },
    ]);

    // 6. DELIVERIES
    await Delivery.insertMany([
      {
        supplierId: suppliers[0]._id,
        supplierName: suppliers[0].name,
        itemName: "Gold Ring 22K",
        quantity: 5,
        status: "Delivered",
        date: new Date(),
        invoiceUrl: "",
      },
    ]);

    console.log("---------------------------------------------------------");
    console.log("✅ SEED COMPLETED SUCCESSFULLY");
    console.log("---------------------------------------------------------");
    console.log("👉 ADMIN:    admin@sjm.com       | Pass: Admin123!");
    console.log("👉 MANAGER:  manager@sjm.com     | Pass: Manager123!");
    console.log("👉 SUPPLIER: supplier@vertex.com | Pass: Supplier123!");
    console.log("---------------------------------------------------------");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
};

run();