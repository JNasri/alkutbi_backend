const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const deathCaseController = require("../controllers/deathCaseController");
const { logger } = require("../middleware/logger");

// Multiple attachments (10 fields max)
const attachmentFields = [
  { name: "entryStamp", maxCount: 1 },
  { name: "deathCertificate", maxCount: 1 },
  { name: "passportAttachment", maxCount: 1 },
  { name: "visaAttachment", maxCount: 1 },
  { name: "consulateCertificate", maxCount: 1 },
  { name: "deathReport", maxCount: 1 },
  { name: "hospitalLetter", maxCount: 1 },
  { name: "corpseBurialPermit", maxCount: 1 },
  { name: "policeLetter", maxCount: 1 },
  { name: "otherAttachment", maxCount: 1 },
];

router
  .route("/")
  .get(deathCaseController.getAllDeathCases)
  .post(upload.fields(attachmentFields), logger, deathCaseController.createDeathCase)
  .patch(upload.fields(attachmentFields), logger, deathCaseController.updateDeathCase)
  .delete(logger, deathCaseController.deleteDeathCase);

// Route for /deathcases/:id
router.route("/:id").get(deathCaseController.getDeathCaseById);

module.exports = router;
