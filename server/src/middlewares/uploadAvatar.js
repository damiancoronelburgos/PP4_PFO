import multer from "multer";
import path from "path";
import fs from "fs";

// ===== Directorio de avatares =====
const AVATAR_DIR = path.resolve("uploads", "avatars");

if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

// ===== Storage y nombre de archivo =====
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, AVATAR_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = `avatar_${req.user?.sub || "user"}`;
    const unique = Date.now();
    cb(null, `${base}_${unique}${ext}`);
  },
});

// ===== Filtro de tipo de archivo =====
function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de imagen no permitido"), false);
  }
}

// ===== Instancia de multer =====
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
});

export default upload;