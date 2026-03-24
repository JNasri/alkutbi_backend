const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.route("/summary").get(dashboardController.getDashboardSummary);

module.exports = router;
