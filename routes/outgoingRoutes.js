const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const outgoingController = require("../controllers/outgoingController");
const { logger } = require("../middleware/logger");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES = require("../config/roles");

const canAdd = [ROLES.Admin, ROLES.Special_Papers_Manager, ROLES.Special_Papers_Employee];
const canEdit = [ROLES.Admin, ROLES.Special_Papers_Manager];

router
  .route("/")
  .get(outgoingController.getAllOutgoings)
  .post(verifyRoles(...canAdd), upload.single("attachment"), logger, outgoingController.createNewOutgoing)
  .patch(verifyRoles(...canEdit), upload.single("attachment"), logger, outgoingController.updateOutgoing)
  .delete(verifyRoles(...canEdit), logger, outgoingController.deleteOutgoing);

router.route("/:id").get(outgoingController.getOutgoingById);

module.exports = router;
