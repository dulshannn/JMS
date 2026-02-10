import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- IMPORT ROUTES ---
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import jewelleryRoutes from "./routes/jewelleryRoutes.js";
import lockerRoutes from "./routes/lockerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import designRoutes from "./routes/designRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";

dotenv.config();
const app = express();

if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET is missing.");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// CORS Configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(cookieParser());
app.use(express.json({ limit: "50mb" })); 
app.use("/uploads", express.static(uploadDir));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database Connected"))
  .catch(err => {
    console.log("❌ DB Error:", err.message);
    console.log("⚠️  Starting server without database connection...");
    console.log("📝 Make sure MongoDB is running on:", process.env.MONGO_URI);
  });

// --- MOUNT ROUTES ---
app.use("/api/auth", authRoutes);       
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/stock", stockRoutes);     
app.use("/api/jewellery", jewelleryRoutes);
app.use("/api/locker", lockerRoutes); 
app.use("/api/orders", orderRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

// Test endpoint
app.get("/api/test", (req, res) => {
  console.log("🔍 Test endpoint hit!");
  res.status(200).json({ message: "Server is working!", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));