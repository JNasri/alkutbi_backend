const generateId = require("./generateId");

async function generatePurchaseOrderId() {
  return generateId("PO");
}

module.exports = generatePurchaseOrderId;
