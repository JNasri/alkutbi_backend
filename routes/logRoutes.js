const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const logController = require("../controllers/logController");

router.route("/").get(logController.getLogs);

module.exports = router;
