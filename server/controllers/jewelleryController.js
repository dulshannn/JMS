import Jewellery from "../models/Jewellery.js";

/* ✅ GET ALL */
export const getJewellery = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const query = search
      ? { name: { $regex: search.trim(), $options: "i" } }
      : {};

    const jewellery = await Jewellery.find(query).sort({ createdAt: -1 });
    res.status(200).json({ data: jewellery });
  } catch (err) {
    console.error("❌ getJewellery:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ✅ GET ONE */
export const getJewelleryById = async (req, res) => {
  try {
    const item = await Jewellery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Jewellery not found" });
    res.status(200).json(item);
  } catch (err) {
    console.error("❌ getJewelleryById:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ✅ CREATE */
export const createJewellery = async (req, res) => {
  try {
    const { name, type, weight, quantity, price, description } = req.body;

    if (!name?.trim())
      return res.status(400).json({ message: "Jewellery name is required" });

    const item = await Jewellery.create({
      name: name.trim(),
      type,
      weight,
      quantity,
      price,
      description,
      createdBy: req.user?._id || null,
    });

    res.status(201).json({ message: "Jewellery added ✅", data: item });
  } catch (err) {
    console.error("❌ createJewellery:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ✅ UPDATE */
export const updateJewellery = async (req, res) => {
  try {
    const updated = await Jewellery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Jewellery not found" });
    res.status(200).json({ message: "Jewellery updated ✅", data: updated });
  } catch (err) {
    console.error("❌ updateJewellery:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ✅ DELETE */
export const deleteJewellery = async (req, res) => {
  try {
    const deleted = await Jewellery.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Jewellery not found" });

    res.status(200).json({ message: "Jewellery deleted ✅" });
  } catch (err) {
    console.error("❌ deleteJewellery:", err);
    res.status(500).json({ message: "Server error" });
  }
};
