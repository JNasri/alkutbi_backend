const express = require("express");
const router = express.Router();
const collectionOrderController = require("../controllers/collectionOrderController");
const upload = require("../config/multer");
const { logger } = require("../middleware/logger");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES = require("../config/roles");

const canView = [ROLES.Admin, ROLES.Finance_Admin, ROLES.Finance_Sub_Admin, ROLES.Finance_Employee, ROLES.Special_Papers_Manager];
const canAdd  = [ROLES.Admin, ROLES.Finance_Admin, ROLES.Finance_Sub_Admin, ROLES.Finance_Employee, ROLES.Special_Papers_Manager];
const canEdit = [ROLES.Admin, ROLES.Finance_Admin, ROLES.Finance_Sub_Admin, ROLES.Finance_Employee, ROLES.Special_Papers_Manager];
const canDelete = [ROLES.Admin, ROLES.Finance_Admin, ROLES.Finance_Sub_Admin, ROLES.Finance_Employee, ROLES.Special_Papers_Manager];

const orderFiles = upload.fields([
  { name: "receipt", maxCount: 1 },
  { name: "orderPrint", maxCount: 1 },
]);

router
  .route("/")
  .get(verifyRoles(...canView), collectionOrderController.getAllCollectionOrders)
  .post(verifyRoles(...canAdd), orderFiles, logger, collectionOrderController.createNewCollectionOrder)
  .patch(verifyRoles(...canEdit), orderFiles, logger, collectionOrderController.updateCollectionOrder)
  .delete(verifyRoles(...canDelete), logger, collectionOrderController.deleteCollectionOrder);

router.route("/bulk").post(verifyRoles(...canAdd), collectionOrderController.createBulkCollectionOrders);

module.exports = router;
