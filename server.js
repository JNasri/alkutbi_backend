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
app.use(express.json({ limit: "50mb" }));
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
app.use("/purchaseorders", verifyJWT, require("./routes/purchaseOrderRoutes"));
app.use("/collectionorders", verifyJWT, require("./routes/collectionOrderRoutes"));
app.use("/banks", verifyJWT, require("./routes/bankRoutes"));
app.use("/dashboard", verifyJWT, logger, require("./routes/dashboardRoutes"));
app.use("/s3", verifyJWT, require("./routes/s3Routes"));

// app listen + (err handler)
app.use(errorHandler);
const seedBanks = async () => {
  const Bank = require("./models/Bank");
  const count = await Bank.countDocuments();
  if (count === 0) {
    await Bank.insertMany([
      { name: "البنك الأهلي", ibanNumber: "SA5510000086300001050509" },
      { name: "بنك الخليج", ibanNumber: "SA6190000000020000002614" },
      { name: "بنك البلاد", ibanNumber: "SA1415000679139652670007" },
      { name: "بنك الإنماء", ibanNumber: "SA9505000068205703178000" },
      { name: "بنك الاستثمار", ibanNumber: "SA7965000000221435000001" },
    ]);
    console.log("Initial banks seeded!");
  }
};

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB!");
  seedBanks();
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
