const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const outgoingController = require("../controllers/outgoingController");

router
  .route("/")
  .get(outgoingController.getAllOutgoings)
  .post(upload.single("attachment"), outgoingController.createNewOutgoing)
  .patch(upload.single("attachment"), outgoingController.updateOutgoing)
  .delete(outgoingController.deleteOutgoing);

// Route for /outgoings/:id
router.route("/:id").get(outgoingController.getOutgoingById);

module.exports = router;
