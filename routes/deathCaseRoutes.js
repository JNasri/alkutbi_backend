const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const deathCaseController = require("../controllers/deathCaseController");
const { logger } = require("../middleware/logger");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES = require("../config/roles");

const canAdd = [ROLES.Admin, ROLES.Special_Papers_Manager, ROLES.Special_Papers_Employee];
const canEdit = [ROLES.Admin, ROLES.Special_Papers_Manager];

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
  .post(verifyRoles(...canAdd), upload.fields(attachmentFields), logger, deathCaseController.createDeathCase)
  .patch(verifyRoles(...canEdit), upload.fields(attachmentFields), logger, deathCaseController.updateDeathCase)
  .delete(verifyRoles(...canEdit), logger, deathCaseController.deleteDeathCase);

router.route("/:id").get(deathCaseController.getDeathCaseById);

module.exports = router;
