const express = require("express");
const router = express.Router();
const bankController = require("../controllers/bankController");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES = require("../config/roles");

const canManage = [ROLES.Admin, ROLES.Finance_Admin];

// All finance roles can read banks; only admin/finance_admin can mutate
router
  .route("/")
  .get(bankController.getAllBanks)
  .post(verifyRoles(...canManage), bankController.createBank)
  .patch(verifyRoles(...canManage), bankController.updateBank)
  .delete(verifyRoles(...canManage), bankController.deleteBank);

module.exports = router;
