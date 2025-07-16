const Outgoing = require("../models/Outgoing");

async function generateOutgoingId() {
  const now = new Date();

  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const datePrefix = yy + mm + dd;

  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));

  const count = await Outgoing.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const number = String(count + 1).padStart(2, "0");
  return datePrefix + number; // e.g., 25061301
}

module.exports = generateOutgoingId;
