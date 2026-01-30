const asyncHandler = require("express-async-handler");
const Audit = require("../models/Audit");
const fs = require("fs");
const path = require("path");

// Function to clear old logs
const clearOldLogs = () => {
  const logFiles = ["reqLog.log", "errLog.log", "mongoErrLog.log"];
  const logsDir = path.join(__dirname, "..", "logs");

  logFiles.forEach((file) => {
    const filePath = path.join(logsDir, file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted old log file: ${file}`);
      } catch (err) {
        console.error(`Could not delete log file ${file}:`, err);
      }
    }
  });
};

// Start from today's date: We can either clear the collection or just let the new model start fresh.
// Since we just created the Audit model, it's already empty.
// deleting the old files serves the purpose of "remove all previous audits".
clearOldLogs();

const getLogs = asyncHandler(async (req, res) => {
  const audits = await Audit.find().sort({ createdAt: -1 }).lean();

  if (!audits?.length) {
    return res.status(200).json([]);
  }

  // Map to the format expected by frontend if needed, 
  // but better to update frontend to handle the new object structure.
  res.json(audits);
});

module.exports = {
  getLogs,
};
