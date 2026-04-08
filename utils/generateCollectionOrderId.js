const generateId = require("./generateId");

async function generateCollectionOrderId(dateAD) {
  return generateId("CO", dateAD);
}

module.exports = generateCollectionOrderId;