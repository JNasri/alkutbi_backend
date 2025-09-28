const PrisonCase = require("../models/PrisonCase");

async function generatePrisonId() {
  const datePrefix = "P";

  // Count all records in the collection
  const count = await PrisonCase.countDocuments();

  // Increment by 1
  const number = String(count + 1).padStart(3, "0");

  return datePrefix + number; // e.g. P001, P002, ...
}

module.exports = generatePrisonId;
