const rateLimit = require("express-rate-limit");
const { logEvents } = require("./logger");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: {
    message:
      "Too many login attempts from this IP, please try again after 60 seconds",
  },
  handler: (req, res, next, options) => {
    logEvents(`Too many attempts on ${req.url}`, "LoginLimiterError.log");
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimiter;
