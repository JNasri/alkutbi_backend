const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");

const getLogs = asyncHandler(async (req, res) => {
  const logPath = path.join(__dirname, "..", "logs", "reqLog.log");

  fs.readFile(logPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Log file not found." });
    }
    res.json({ logs: data });
  });
});

module.exports = {
  getLogs,
};
