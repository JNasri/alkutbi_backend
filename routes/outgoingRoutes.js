const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const outgoingController = require("../controllers/outgoingController");
const { logger } = require("../middleware/logger");

router
  .route("/")
  .get(outgoingController.getAllOutgoings)
  .post(upload.single("attachment"), logger, outgoingController.createNewOutgoing)
  .patch(upload.single("attachment"), logger, outgoingController.updateOutgoing)
  .delete(logger, outgoingController.deleteOutgoing);

// Route for /outgoings/:id
router.route("/:id").get(outgoingController.getOutgoingById);

module.exports = router;
