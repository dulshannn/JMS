import multer from "multer";
import path from "path";
import fs from "fs";

const designsDir = path.join(process.cwd(), "uploads", "designs");
if (!fs.existsSync(designsDir)) fs.mkdirSync(designsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, designsDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`);
  },
});

const fileFilter = (req, file, cb) => {
  // allow images + pdf
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPG/PNG/WEBP/PDF allowed"), false);
  }
  cb(null, true);
};

export const uploadDesign = multer({
  storage,
  fileFilter,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB each
});
