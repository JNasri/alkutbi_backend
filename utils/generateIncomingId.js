const Incoming = require("../models/Incoming");

// generate a name by the getCurrentTimestampString
async function generateIncomingId() {
  const now = new Date();
  
  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const datePrefix = "W-" + yy + mm + dd;

  // Find the last record created today with this prefix to ensure unique sequence
  const lastRecord = await Incoming.findOne({
    identifier: { $regex: `^${datePrefix}` }
  }).sort({ identifier: -1 });

  let nextNumber = 1;
  if (lastRecord && lastRecord.identifier) {
    const lastNumberStr = lastRecord.identifier.replace(datePrefix, "");
    const lastNumber = parseInt(lastNumberStr, 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  const number = String(nextNumber).padStart(3, "0");
  return datePrefix + number; 
}

module.exports = generateIncomingId;
