const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assetController");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES = require("../config/roles");

const canAccess = [
  ROLES.Admin,
  ROLES.Operation_Manager,
  ROLES.Operation_Employee,
  ROLES.Special_Papers_Manager,
  ROLES.Special_Papers_Employee,
];

router
  .route("/")
  .get(verifyRoles(...canAccess), assetController.getAllAssets)
  .post(verifyRoles(...canAccess), assetController.createAsset)
  .patch(verifyRoles(...canAccess), assetController.updateAsset)
  .delete(verifyRoles(...canAccess), assetController.deleteAsset);

router.route("/:id").get(verifyRoles(...canAccess), assetController.getAssetById);

module.exports = router;
