const generateId = require("./generateId");

async function generateCollectionOrderId() {
  return generateId("CO");
}

module.exports = generateCollectionOrderId;