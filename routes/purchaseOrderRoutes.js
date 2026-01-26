const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrderController");

router
  .route("/")
  .get(purchaseOrderController.getAllPurchaseOrders)
  .post(purchaseOrderController.createNewPurchaseOrder)
  .patch(purchaseOrderController.updatePurchaseOrder)
  .delete(purchaseOrderController.deletePurchaseOrder);

module.exports = router;
