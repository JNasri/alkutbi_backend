const express = require("express");
const router = express.Router();
const collectionOrderController = require("../controllers/collectionOrderController");
const upload = require("../config/multer");

router
  .route("/")
  .get(collectionOrderController.getAllCollectionOrders)
  .post(upload.single("file"), collectionOrderController.createNewCollectionOrder)
  .patch(upload.single("file"), collectionOrderController.updateCollectionOrder)
  .delete(collectionOrderController.deleteCollectionOrder);

module.exports = router;
