const generateId = require("./generateId");

async function generateDeathId() {
  return generateId("D");
}

module.exports = generateDeathId;