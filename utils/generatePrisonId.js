const PrisonCase = require("../models/PrisonCase");

// generate a name by the getCurrentTimestampString
async function generatePrisonId() {
  const now = new Date();
    const datePrefix = "P"
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    const count = await PrisonCase.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    const number = String(count + 1).padStart(3, "0");
    return datePrefix + number; 
}

module.exports = generatePrisonId;
