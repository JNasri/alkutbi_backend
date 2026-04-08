const generateId = require("./generateId");

async function generatePurchaseOrderId(dateAD) {
  return generateId("PO", dateAD);
}

module.exports = generatePurchaseOrderId;
