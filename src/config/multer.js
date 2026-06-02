
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Dynamic upload setup
 * @param {String} folderName - Target folder name (inside /public/uploads)
 */
const createUpload = (folderName) => {
  const uploadPath = path.join(__dirname, "..", "..", "public", "uploads", folderName);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file type, only JPG, PNG, WEBP, or SVG allowed!"), false);
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
};

module.exports = createUpload;
