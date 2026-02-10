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
    const admin = await User.create({
      name: "Super Admin",
      email: "admin@sjm.com",
      password: adminPass,
      role: "admin",
      phone: "0771112233",
      isActive: true,
      otpVerified: true,
    });

    const manager = await User.create({
      name: "Store Manager",
      email: "manager@sjm.com",
      password: managerPass,
      role: "manager",
      phone: "0775556666",
      isActive: true,
      otpVerified: true,
    });

    await User.create({
      name: "Loyal Customer",
      email: "customer@sjm.com",
      password: custPass,
      role: "customer",
      isActive: true,
      otpVerified: true,
    });

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
        category: "Jewellery & Raw Gold",
        status: "active"
      },
    ]);

    // 5. JEWELLERY DATA
    const jewelries = await Jewellery.insertMany([
      {
        name: "Classic Gold Ring 22K",
        type: "Ring",
        weight: 4.2,
        quantity: 12,
        price: 125000,
        description: "Elegant 22K gold wedding band with a polished finish.",
        createdBy: supplierUser._id,
      },
      {
        name: "Diamond Studded Pendant",
        type: "Necklace",
        weight: 8.5,
        quantity: 5,
        price: 350000,
        description: "18K white gold pendant featuring a 0.5-carat center diamond.",
        createdBy: supplierUser._id,
      },
      {
        name: "Rose Gold Bangle",
        type: "Bracelet",
        weight: 12.0,
        quantity: 8,
        price: 210000,
        description: "Modern rose gold bangle with intricate floral engravings.",
        createdBy: supplierUser._id,
      },
      {
        name: "Sapphire Drop Earrings",
        type: "Earrings",
        weight: 6.8,
        quantity: 3,
        price: 185000,
        description: "Blue sapphire earrings set in 22K yellow gold frames.",
        createdBy: supplierUser._id,
      },
      {
        name: "Traditional Haram Necklace",
        type: "Necklace",
        weight: 48.0,
        quantity: 2,
        price: 950000,
        description: "Heavy traditional 22K gold necklace for bridal wear.",
        createdBy: supplierUser._id,
      },
      {
        name: "Minimalist Gold Chain",
        type: "Necklace",
        weight: 5.5,
        quantity: 20,
        price: 85000,
        description: "Thin 22K gold chain, perfect for daily wear.",
        createdBy: supplierUser._id,
      },
      {
        name: "Emerald Cocktail Ring",
        type: "Ring",
        weight: 7.2,
        quantity: 4,
        price: 275000,
        description: "Stunning 18K gold ring with a large emerald centerpiece.",
        createdBy: supplierUser._id,
      }
    ]);

    // 6. DELIVERIES
    await Delivery.insertMany([
      {
        supplierId: suppliers[0]._id,
        supplierName: suppliers[0].name,
        itemName: "Classic Gold Ring 22K",
        quantity: 12,
        status: "Delivered",
        date: new Date(),
        invoiceUrl: "https://example.com/invoice001.pdf",
      },
      {
        supplierId: suppliers[0]._id,
        supplierName: suppliers[0].name,
        itemName: "Traditional Haram Necklace",
        quantity: 2,
        status: "Pending",
        date: new Date(),
        invoiceUrl: "https://example.com/invoice002.pdf",
      },
    ]);

    // 7. INITIAL STOCK LOGS (Fixed itemName validation)
    await Stock.insertMany(
      jewelries.map(item => ({
        jewelleryId: item._id,
        itemName: item.name, // Fixed: Adding the missing required field
        quantity: item.quantity,
        type: "initial_seed",
        date: new Date(),
      }))
    );

    console.log("---------------------------------------------------------");
    console.log("✅ SEED COMPLETED SUCCESSFULLY");
    console.log("---------------------------------------------------------");
    console.log(`📊 Seeded ${jewelries.length} Jewellery items`);
    console.log("👉 ADMIN:    admin@sjm.com       | Pass: Admin123!");
    console.log("👉 MANAGER:  manager@sjm.com     | Pass: Manager123!");
    console.log("👉 SUPPLIER: supplier@vertex.com | Pass: Supplier123!");
    console.log("👉 CUSTOMER: customer@sjm.com    | Pass: Customer123!");
    console.log("---------------------------------------------------------");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
};

run();