const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES = require("../config/roles");

// Admin only
router
  .route("/")
  .get(verifyRoles(ROLES.Admin), userController.getAllUsers)
  .post(verifyRoles(ROLES.Admin), userController.createNewUser)
  .patch(verifyRoles(ROLES.Admin), userController.updateUser)
  .delete(verifyRoles(ROLES.Admin), userController.deleteUser);

router.route("/:id").get(verifyRoles(ROLES.Admin), userController.getUserById);

module.exports = router;
