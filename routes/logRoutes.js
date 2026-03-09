const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES = require("../config/roles");

router.route("/").get(verifyRoles(ROLES.Admin, ROLES.Finance_Admin), logController.getLogs);

module.exports = router;
