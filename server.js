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
app.use("/vouchers", verifyJWT, logger, require("./routes/voucherRoutes"));
app.use("/incomings", verifyJWT, logger, require("./routes/incomingRoutes"));
app.use("/outgoings", verifyJWT, logger, require("./routes/outgoingRoutes"));

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
