const generateId = require("./generateId");

async function generateOutgoingId() {
  return generateId("S");
}

module.exports = generateOutgoingId;
