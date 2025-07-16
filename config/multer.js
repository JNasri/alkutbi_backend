// config/multer.js
const multer = require("multer");

// Use memory storage so the file stays in RAM until we upload to S3
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Optional: 10MB limit
  fileFilter: (req, file, cb) => {
    // Optional: Add file type checking here
    cb(null, true);
  },
});

module.exports = upload;
