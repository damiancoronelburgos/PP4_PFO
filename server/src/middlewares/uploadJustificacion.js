// server/src/middlewares/uploadJustificacion.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ===== Directorio de justificaciones =====
const JUSTIF_DIR = path.resolve("uploads", "justificaciones");

if (!fs.existsSync(JUSTIF_DIR)) {
  fs.mkdirSync(JUSTIF_DIR, { recursive: true });
}

// ===== Storage para PDFs e imágenes =====
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, JUSTIF_DIR);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = Date.now();
    cb(null, `justif_${req.user?.sub || "alumno"}_${unique}${ext}`);
  },
});

// ===== Tipos de archivo permitidos =====
function fileFilter(req, file, cb) {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg"
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato inválido. Solo PDF o imágenes."), false);
  }
}

// ===== Instancia de multer =====
const uploadJustificacion = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB máx
  },
});

export default uploadJustificacion;
