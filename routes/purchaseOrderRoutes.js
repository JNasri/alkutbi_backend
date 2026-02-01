const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrderController");
const upload = require("../config/multer");

router
  .route("/")
  .get(purchaseOrderController.getAllPurchaseOrders)
  .post(upload.single("file"), purchaseOrderController.createNewPurchaseOrder)
  .patch(upload.single("file"), purchaseOrderController.updatePurchaseOrder)
  .delete(purchaseOrderController.deletePurchaseOrder);

module.exports = router;
