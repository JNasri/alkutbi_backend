const DeathCase = require("../models/DeathCase");

// generate a name by the getCurrentTimestampString
async function generateDeathId() {
  const now = new Date();
  
    const yy = now.getFullYear().toString().slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const datePrefix = "D-" + yy + mm + dd;
  
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
  
    const count = await DeathCase.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
  
    const number = String(count + 1).padStart(3, "0");
    return datePrefix + number; 
}

module.exports = generateDeathId;
