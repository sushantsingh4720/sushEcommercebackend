const express = require("express");
const router = express.Router();
const {
  userRegister,
  userLogin,
  userLogout,
  userForgotPassword,
  userResetPassword,
  getUserDetais,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSpecificUserDetails,
  updateUserRole,
  deleteSpecificUser,
} = require("../controllers/userController");
const {
  isAuthenticatedUser,
  authorizationRoles,
} = require("../middleware/authMiddleware");

router.route("/register").post(userRegister);
router.route("/login").post(userLogin);
router.route("/logout").post(userLogout);
router.route("/forgotpassword").post(userForgotPassword);
router.route("/forgotpassword/:token").put(userResetPassword);
router.route("/me").get(isAuthenticatedUser, getUserDetais);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/updateProfile").put(isAuthenticatedUser, updateProfile);
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizationRoles("admin"), getAllUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizationRoles("admin"), getSpecificUserDetails)
  .put(isAuthenticatedUser, authorizationRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizationRoles("admin"), deleteSpecificUser);

module.exports = router;
