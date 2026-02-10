const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrderController");
const upload = require("../config/multer");

const { logger } = require("../middleware/logger");

router
  .route("/")
  .get(purchaseOrderController.getAllPurchaseOrders)
  .post(
    upload.fields([
      { name: "receipt", maxCount: 1 },
      { name: "orderPrint", maxCount: 1 },
    ]),
    logger,
    purchaseOrderController.createNewPurchaseOrder
  )
  .patch(
    upload.fields([
      { name: "receipt", maxCount: 1 },
      { name: "orderPrint", maxCount: 1 },
    ]),
    logger,
    purchaseOrderController.updatePurchaseOrder
  )
  .delete(logger, purchaseOrderController.deletePurchaseOrder);

module.exports = router;
