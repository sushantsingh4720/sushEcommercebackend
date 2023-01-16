const express = require("express");
const router = express.Router();
const {
  isAuthenticatedUser,
  authorizationRoles,
} = require("../middleware/authMiddleware");
const {
  orderNewProduct,
  getSingleOrderDetail,
  getAllOrderDetails,
  getAllUserOrderDetails,
  updateOrder,
  deleteOrder
} = require("../controllers/orderController");

router.route("/newOrder").post(isAuthenticatedUser, orderNewProduct);
router.route("/me/:id").get(isAuthenticatedUser, getSingleOrderDetail);
router.route("/me").get(isAuthenticatedUser, getAllOrderDetails);
router
  .route("/admin/usersOrders")
  .get(
    isAuthenticatedUser,
    authorizationRoles("admin"),
    getAllUserOrderDetails
  );
router
  .route("/updateOrder/:id")
  .put(isAuthenticatedUser, authorizationRoles("admin"), updateOrder);
router.route("/deleteOrder/:id").delete(isAuthenticatedUser, authorizationRoles("admin"),deleteOrder)
module.exports = router;
