const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const incomingController = require("../controllers/incomingController");
const { logger } = require("../middleware/logger");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES = require("../config/roles");

const canAdd = [ROLES.Admin, ROLES.Special_Papers_Manager, ROLES.Special_Papers_Employee];
const canEdit = [ROLES.Admin, ROLES.Special_Papers_Manager];

router
  .route("/")
  .get(incomingController.getAllIncomings)
  .post(verifyRoles(...canAdd), upload.single("attachment"), logger, incomingController.createNewIncoming)
  .patch(verifyRoles(...canEdit), upload.single("attachment"), logger, incomingController.updateIncoming)
  .delete(verifyRoles(...canEdit), logger, incomingController.deleteIncoming);

router.route("/:id").get(incomingController.getIncomingById);

module.exports = router;
