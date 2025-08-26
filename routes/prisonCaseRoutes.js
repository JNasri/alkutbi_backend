const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const prisonCaseController = require("../controllers/prisonCaseController");

// Multiple attachments (10 fields max)
const attachmentFields = [
  { name: "passportAttachment", maxCount: 1 },
  { name: "visaAttachment", maxCount: 1 },
];

router
  .route("/")
  .get(prisonCaseController.getAllPrisonCases)
  .post(upload.fields(attachmentFields), prisonCaseController.createPrisonCase)
  .patch(upload.fields(attachmentFields), prisonCaseController.updatePrisonCase)
  .delete(prisonCaseController.deletePrisonCase);

// Route for /deathcases/:id
router.route("/:id").get(prisonCaseController.getPrisonCaseById);

module.exports = router;
