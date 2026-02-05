const express = require("express");
const router = express.Router();
const collectionOrderController = require("../controllers/collectionOrderController");
const upload = require("../config/multer");

const { logger } = require("../middleware/logger");

router
  .route("/")
  .get(collectionOrderController.getAllCollectionOrders)
  .post(upload.single("file"), logger, collectionOrderController.createNewCollectionOrder)
  .patch(upload.single("file"), logger, collectionOrderController.updateCollectionOrder)
  .delete(logger, collectionOrderController.deleteCollectionOrder);

module.exports = router;
