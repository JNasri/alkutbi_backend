const PurchaseOrder = require("../models/PurchaseOrder");

async function generatePurchaseOrderId() {
  const now = new Date();

  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const datePrefix = "PO-" + yy + mm + dd;

  // Find the last order created today with this prefix to ensure unique sequence
  const lastOrder = await PurchaseOrder.findOne({
    purchasingId: { $regex: `^${datePrefix}` }
  }).sort({ purchasingId: -1 });

  let nextNumber = 1;
  if (lastOrder && lastOrder.purchasingId) {
    const lastNumberStr = lastOrder.purchasingId.replace(datePrefix, "");
    const lastNumber = parseInt(lastNumberStr, 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  const number = String(nextNumber).padStart(3, "0");
  return datePrefix + number; 
}

module.exports = generatePurchaseOrderId;
