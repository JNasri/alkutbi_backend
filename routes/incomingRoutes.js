const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const incomingController = require("../controllers/incomingController");

router
  .route("/")
  .get(incomingController.getAllIncomings)
  .post(upload.single("attachment"), incomingController.createNewIncoming)
  .patch(upload.single("attachment"), incomingController.updateIncoming)
  .delete(incomingController.deleteIncoming);

// Route for /incomings/:id
router.route("/:id").get(incomingController.getIncomingById);

module.exports = router;
