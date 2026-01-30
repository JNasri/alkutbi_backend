const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const prisonCaseController = require("../controllers/prisonCaseController");
const { logger } = require("../middleware/logger");

// Multiple attachments (10 fields max)
const attachmentFields = [
  { name: "passportAttachment", maxCount: 1 },
  { name: "visaAttachment", maxCount: 1 },
];

router
  .route("/")
  .get(prisonCaseController.getAllPrisonCases)
  .post(upload.fields(attachmentFields), logger, prisonCaseController.createPrisonCase)
  .patch(upload.fields(attachmentFields), logger, prisonCaseController.updatePrisonCase)
  .delete(logger, prisonCaseController.deletePrisonCase);

// Route for /prisoncases/:id
router.route("/:id").get(prisonCaseController.getPrisonCaseById);

module.exports = router;
