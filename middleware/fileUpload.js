const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: "public/files",
  filename: function (req, file, cb) {
    const uniqueId = crypto.randomUUID();
    const cleanFileName = file.originalname.replace(/\s+/g, "-");
    const ext = path.extname(cleanFileName);
    const uniqueSuffix =
      Date.now().toString(36).substr(-2) +
      Math.random().toString(36).substr(2, 3);
    const finalName = `${uniqueId}-${uniqueSuffix}${ext}`;
    cb(null, finalName);
  },
});

const uploadFile = multer({
  storage: storage,
  limits: {
    fileSize: 250 * 1024 * 1024, // 10MB
  },
});

module.exports = uploadFile;
