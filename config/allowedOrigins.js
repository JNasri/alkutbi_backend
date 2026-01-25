const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",")
  : [];

module.exports = allowedOrigins;
