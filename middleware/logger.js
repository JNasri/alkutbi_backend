const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const logEvents = async (message, logName) => {
  const dateTime = format(new Date(), "dd-MM-yyyy\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logName),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};

const logger = (req, res, next) => {
  // logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  // console.log(`${req.method} ${req.path}`);
  // next();
  // Get username if available (set by verifyJWT), otherwise 'Guest'
  const username = req.user || "Guest";
  const logMessage =
    `\n` +
    `Method: ${req.method}\n` +
    `URL: ${req.originalUrl}\n` +
    `Username: ${username}\n` +
    `Origin: ${req.headers.origin || "Unknown"}\n`;
  logEvents(logMessage, "reqLog.log");
  next();
};

module.exports = { logEvents, logger };
