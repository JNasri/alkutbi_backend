const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const incomingController = require("../controllers/incomingController");
const { logger } = require("../middleware/logger");

router
  .route("/")
  .get(incomingController.getAllIncomings)
  .post(upload.single("attachment"), logger, incomingController.createNewIncoming)
  .patch(upload.single("attachment"), logger, incomingController.updateIncoming)
  .delete(logger, incomingController.deleteIncoming);

// Route for /incomings/:id
router.route("/:id").get(incomingController.getIncomingById);

module.exports = router;
