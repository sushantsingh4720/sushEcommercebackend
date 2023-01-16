const express = require("express");
const router = express.Router();
const {
  isAuthenticatedUser,
  authorizationRoles,
} = require("../middleware/authMiddleware");
const {createProductReview,
  getAllProducts,
  createNewProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  getProductAllReviews,
  deleteProductReview
  
} = require("../controllers/productController");

router.route("/").get(getAllProducts);
router
  .route("/new")
  .post(isAuthenticatedUser, authorizationRoles("admin"), createNewProduct);
router
  .route("/:id")
  .put(isAuthenticatedUser, authorizationRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizationRoles("admin"), deleteProduct)
  .get(getProductDetails);
router.route("/review/:productId").post(isAuthenticatedUser, createProductReview);
router.route("/getProductReviews/:productId").get(getProductAllReviews)
router.route("/deleteReviews/:productId").delete(isAuthenticatedUser,deleteProductReview )
module.exports = router;
