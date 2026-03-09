const generateId = require("./generateId");

async function generateIncomingId() {
  return generateId("W");
}

module.exports = generateIncomingId;
