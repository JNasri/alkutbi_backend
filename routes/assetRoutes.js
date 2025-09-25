const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assetController");

// Route for /assets - all main methods chained
router
  .route("/")
  .get(assetController.getAllAssets) // GET /assets
  .post(assetController.createAsset) // POST /assets
  .patch(assetController.updateAsset) // PATCH /assets (update with id in body)
  .delete(assetController.deleteAsset); // DELETE /assets (delete with id in body)

// Route for /assets/:id - only GET by ID
router.route("/:id").get(assetController.getAssetById);

module.exports = router;
