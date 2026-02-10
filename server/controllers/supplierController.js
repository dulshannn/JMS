import Supplier from "../models/Supplier.js";

export const createSupplier = async (req, res) => {
  try {
    const { name, company, phone, email, address } = req.body;

    if (!name) return res.status(400).json({ message: "Supplier name QUAL required" });

    const supplier = await Supplier.create({
      name,
      company,
      phone,
      email,
      address,
      createdBy: req.user?.id,
    });

    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";
    const q = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { company: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const suppliers = await Supplier.find(q).sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { name, company, phone, email, address } = req.body;

    const updated = await Supplier.findByIdAndUpdate(
      req.params.id,
      { name, company, phone, email, address, updatedBy: req.user?.id },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Supplier not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Supplier not found" });

    res.json({ message: "Supplier deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
