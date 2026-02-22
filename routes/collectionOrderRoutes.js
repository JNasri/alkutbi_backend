const express = require("express");
const router = express.Router();
const collectionOrderController = require("../controllers/collectionOrderController");
const upload = require("../config/multer");

const { logger } = require("../middleware/logger");

router
  .route("/")
  .get(collectionOrderController.getAllCollectionOrders)
  .post(
    upload.fields([
      { name: "receipt", maxCount: 1 },
      { name: "orderPrint", maxCount: 1 },
    ]),
    logger,
    collectionOrderController.createNewCollectionOrder
  )
  .patch(
    upload.fields([
      { name: "receipt", maxCount: 1 },
      { name: "orderPrint", maxCount: 1 },
    ]),
    logger,
    collectionOrderController.updateCollectionOrder
  )
  .delete(logger, collectionOrderController.deleteCollectionOrder);

router.route("/bulk").post(collectionOrderController.createBulkCollectionOrders);

module.exports = router;
