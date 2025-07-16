// generate a name by the getCurrentTimestampString
async function generateIncomingId() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1); // Months are zero-indexed
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
}

module.exports = generateIncomingId;
