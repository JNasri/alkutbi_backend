const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const upload = require("../config/multer");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router
  // vouchers
  .route("/")
  .get(voucherController.getAllVouchers)
  .post(upload.single("file"), voucherController.createNewVoucher)
  // no need to delete really, but just in case
  .delete(voucherController.deleteVoucher);

// Route to get a single voucher by ID
router
  .route("/:id")
  .get(voucherController.getVoucherById)
  .patch(upload.single("file"), voucherController.updateVoucher);

module.exports = router;
