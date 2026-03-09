const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const prisonCaseController = require("../controllers/prisonCaseController");
const { logger } = require("../middleware/logger");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES = require("../config/roles");

const canAdd = [ROLES.Admin, ROLES.Special_Papers_Manager, ROLES.Special_Papers_Employee];
const canEdit = [ROLES.Admin, ROLES.Special_Papers_Manager];

const attachmentFields = [
  { name: "passportAttachment", maxCount: 1 },
  { name: "visaAttachment", maxCount: 1 },
];

router
  .route("/")
  .get(prisonCaseController.getAllPrisonCases)
  .post(verifyRoles(...canAdd), upload.fields(attachmentFields), logger, prisonCaseController.createPrisonCase)
  .patch(verifyRoles(...canEdit), upload.fields(attachmentFields), logger, prisonCaseController.updatePrisonCase)
  .delete(verifyRoles(...canEdit), logger, prisonCaseController.deletePrisonCase);

router.route("/:id").get(prisonCaseController.getPrisonCaseById);

module.exports = router;
