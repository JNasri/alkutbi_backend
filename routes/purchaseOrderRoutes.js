const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrderController");
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
  .get(verifyRoles(...canView), purchaseOrderController.getAllPurchaseOrders)
  .post(verifyRoles(...canAdd), orderFiles, logger, purchaseOrderController.createNewPurchaseOrder)
  .patch(verifyRoles(...canEdit), orderFiles, logger, purchaseOrderController.updatePurchaseOrder)
  .delete(verifyRoles(...canDelete), logger, purchaseOrderController.deletePurchaseOrder);

router.post("/bulk", verifyRoles(...canAdd), logger, purchaseOrderController.createBulkPurchaseOrders);

module.exports = router;
