import bcrypt from "bcryptjs";
import Customer from "../models/Customer.js";

/**
 * ✅ CUSTOMER CRUD + SEARCH
 * GET /api/customers?search=...&status=...&page=1&limit=10
 */
export const getCustomers = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;

    const q = {};

    // search by name/email/phone
    if (search.trim()) {
      q.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // filter by status if you use it
    if (status.trim()) {
      q.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      Customer.find(q)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Customer.countDocuments(q),
    ]);

    res.json({
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ GET /api/customers/:id
 */
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("-password");
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ POST /api/customers
 */
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone = "", address = "", password, status = "active" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password required" });
    }

    const exists = await Customer.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      password: hashed,
      status,
      role: "customer",
    });

    res.status(201).json({
      message: "Customer created",
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        status: customer.status,
        role: customer.role,
      },
    });
  } catch (err) {
    console.log("❌ createCustomer error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

/**
 * ✅ PUT /api/customers/:id
 */
export const updateCustomer = async (req, res) => {
  try {
    const { name, phone, address, status } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (name !== undefined) customer.name = name;
    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;
    if (status !== undefined) customer.status = status;

    await customer.save();

    res.json({
      message: "Customer updated",
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        status: customer.status,
        role: customer.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ DELETE /api/customers/:id
 */
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    await customer.deleteOne();

    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ PROFILE: GET /api/customers/me/profile
 */
export const getMyProfile = async (req, res) => {
  try {
    // req.user.id is from JWT middleware
    const customer = await Customer.findById(req.user.id).select("-password");
    if (!customer) return res.status(404).json({ message: "User not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ PROFILE: PUT /api/customers/me/profile
 */
export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const customer = await Customer.findById(req.user.id);
    if (!customer) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) customer.name = name;
    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;

    await customer.save();

    res.json({
      message: "Profile updated",
      user: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        status: customer.status,
        role: customer.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ PASSWORD: PUT /api/customers/me/change-password
 */
export const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const customer = await Customer.findById(req.user.id);
    if (!customer) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, customer.password);
    if (!ok) return res.status(400).json({ message: "Current password incorrect" });

    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
