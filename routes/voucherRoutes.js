const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const upload = require("../config/multer");
const { logger } = require("../middleware/logger");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES = require("../config/roles");

const canAccess = [ROLES.Admin, ROLES.Operation_Manager, ROLES.Operation_Employee];

router
  .route("/")
  .get(voucherController.getAllVouchers)
  .post(verifyRoles(...canAccess), upload.single("file"), logger, voucherController.createNewVoucher)
  .delete(verifyRoles(...canAccess), logger, voucherController.deleteVoucher);

router
  .route("/:id")
  .get(voucherController.getVoucherById)
  .patch(verifyRoles(...canAccess), upload.single("file"), logger, voucherController.updateVoucher);

module.exports = router;
