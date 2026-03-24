const express = require("express");
const router = express.Router();
const s3Controller = require("../controllers/s3Controller");

router.route("/sign").post(s3Controller.getSignedUrl);

module.exports = router;
