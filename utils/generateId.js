const Counter = require("../models/Counter");

/**
 * Atomically generates a sequential ID with the format: PREFIX-YYMMDD-NNN
 * Uses MongoDB findOneAndUpdate with $inc to prevent race conditions.
 *
 * @param {string} prefix - e.g. "PO", "W", "S", "CO", "D"
 * @returns {Promise<string>} - e.g. "PO-260308001"
 */
async function generateId(prefix) {
  const now = new Date();
  const ksaOffset = 3 * 60 * 60 * 1000;
  const ksaTime = new Date(now.getTime() + ksaOffset);

  const yy = ksaTime.getUTCFullYear().toString().slice(-2);
  const mm = String(ksaTime.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(ksaTime.getUTCDate()).padStart(2, "0");
  const datePrefix = `${prefix}-${yy}${mm}${dd}`;

  // Atomically increment the counter for this key.
  // upsert:true creates the document if it doesn't exist yet.
  const counter = await Counter.findOneAndUpdate(
    { key: datePrefix },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const number = String(counter.seq).padStart(3, "0");
  return datePrefix + number;
}

module.exports = generateId;
