import LockerVerification from "../models/LockerVerification.js";
import Jewellery from "../models/Jewellery.js";

export const getVerifications = async (req, res) => {
  try {
    const list = await LockerVerification.find()
      .populate("jewelleryId", "name type")
      .populate("verifiedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ data: list });
  } catch (err) {
    console.error("❌ getVerifications:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createVerification = async (req, res) => {
  try {
    const { jewelleryId, lockerNumber, stage, notes, result, mismatchReason } = req.body;

    if (!jewelleryId || !lockerNumber || !stage) {
      return res.status(400).json({
        message: "Jewellery, locker number and stage are required",
      });
    }

    const jewellery = await Jewellery.findById(jewelleryId);
    if (!jewellery) return res.status(404).json({ message: "Jewellery not found" });

    const proofImage = req.file ? `/${req.file.path.replace(/\\/g, "/")}` : "";

    const item = await LockerVerification.create({
      jewelleryId,
      lockerNumber,
      stage,
      notes: notes || "",
      result: result || "matched",
      mismatchReason: mismatchReason || "",
      proofImage,
      verifiedBy: req.user?._id || null,
    });

    res.status(201).json({ message: "Verification saved ✅", data: item });
  } catch (err) {
    console.error("❌ createVerification:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
