const express = require("express");
const router = express.Router();
const collectionOrderController = require("../controllers/collectionOrderController");

router
  .route("/")
  .get(collectionOrderController.getAllCollectionOrders)
  .post(collectionOrderController.createNewCollectionOrder)
  .patch(collectionOrderController.updateCollectionOrder)
  .delete(collectionOrderController.deleteCollectionOrder);

module.exports = router;
