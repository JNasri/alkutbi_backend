const PrisonCase = require("../models/PrisonCase");

async function generatePrisonId() {
  const datePrefix = "P";

  // Find the last record with this prefix
  const lastRecord = await PrisonCase.findOne({
    identifier: { $regex: `^${datePrefix}` }
  }).sort({ identifier: -1 });

  let nextNumber = 1;
  if (lastRecord && lastRecord.identifier) {
    const lastNumberStr = lastRecord.identifier.replace(datePrefix, "");
    const lastNumber = parseInt(lastNumberStr, 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  const number = String(nextNumber).padStart(3, "0");
  return datePrefix + number; // e.g. P001, P002, ...
}

module.exports = generatePrisonId;
