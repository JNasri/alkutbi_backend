const CollectionOrder = require("../models/CollectionOrder");

async function generateCollectionOrderId() {
  const now = new Date();
  const ksaOffset = 3 * 60 * 60 * 1000;
  const ksaTime = new Date(now.getTime() + ksaOffset);

  const yy = ksaTime.getUTCFullYear().toString().slice(-2);
  const mm = String(ksaTime.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(ksaTime.getUTCDate()).padStart(2, "0");
  const datePrefix = "CO-" + yy + mm + dd;

  // Find the last order created today with this prefix to ensure unique sequence
  const lastOrder = await CollectionOrder.findOne({
    collectingId: { $regex: `^${datePrefix}` }
  }).sort({ collectingId: -1 });

  let nextNumber = 1;
  if (lastOrder && lastOrder.collectingId) {
    const lastNumberStr = lastOrder.collectingId.replace(datePrefix, "");
    const lastNumber = parseInt(lastNumberStr, 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  const number = String(nextNumber).padStart(3, "0");
  return datePrefix + number; 
}

module.exports = generateCollectionOrderId;
