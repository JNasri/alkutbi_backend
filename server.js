// server configs
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;

// mongodb connection
const connectDB = require("./config/db");
const mongoose = require("mongoose");
connectDB();

// built-in middleware
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const errorHandler = require("./middleware/errorHandler");
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// loggers
const { logger, logEvents } = require("./middleware/logger");
const verifyJWT = require("./middleware/verifyJWT");

// Public route (no auth)
app.use("/auth", require("./routes/authRoutes"));

// Protected routes (auth + logging)
app.use("/users", verifyJWT, logger, require("./routes/userRoutes"));
app.use("/vouchers", verifyJWT, require("./routes/voucherRoutes")); // Logger moved inside router
app.use("/incomings", verifyJWT, require("./routes/incomingRoutes")); // Logger moved inside router
app.use("/outgoings", verifyJWT, require("./routes/outgoingRoutes")); // Logger moved inside router
app.use("/deathcases", verifyJWT, require("./routes/deathCaseRoutes")); // Logger moved inside router
app.use("/prisoncases", verifyJWT, require("./routes/prisonCaseRoutes")); // Logger moved inside router
app.use("/assets", verifyJWT, logger, require("./routes/assetRoutes"));
app.use("/logs", verifyJWT, logger, require("./routes/logRoutes"));
app.use("/purchaseorders", verifyJWT, logger, require("./routes/purchaseOrderRoutes"));
app.use("/collectionorders", verifyJWT, logger, require("./routes/collectionOrderRoutes"));

// app listen + (err handler)
app.use(errorHandler);
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB!");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}!`);

  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
