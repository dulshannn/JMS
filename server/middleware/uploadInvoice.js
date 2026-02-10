import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads";

// ✅ Create uploads folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `invoice-${Date.now()}${ext}`);
  },
});

// ✅ File filter (ONLY images)
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed! (jpg, png, gif)"));
  }
};

// ✅ Export ONE SINGLE uploadInvoice middleware
const uploadInvoice = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export default uploadInvoice;
