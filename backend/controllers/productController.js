const asyncHandler = require("express-async-handler");
const Product = require("../models/productModal");
const ApiFeatures = require("../utils/apiFeatures");

//@desc create new product
//@route post  /api/products/new
//@access authorised by admin
exports.createNewProduct = asyncHandler(async (req, res) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

//@desc get all products
//@route get  /api/products/
//@access any one can access
exports.getAllProducts = asyncHandler(async (req, res) => {
  
  
  const resultPerPage = 8;
  const productCount =await Product.countDocuments();
  

  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const product = await apiFeature.query;
  res.status(200).json({
    success: true,
    product,
    productCount
  });
});

//@desc get any specific product details
//@route get  /api/products/:id
//@access any one can access
exports.getProductDetails = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("product not found");
  }
  res.status(200).json({
    success: true,
    product,
    // productCount
  });
});

//@desc update product
//@route put  /api/products/:id
//@access authorised by admin
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("product not found");
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body);
  res.status(200).json({
    success: true,
    product,
  });
});

//@desc delete product
//@route delete  /api/products/:id
//@access authorised by admin

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  console.log(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("product not found");
  }
  product.remove();
  res.status(200).json({
    success: true,
    message: "Product successfully deleted",
  });
});

//@desc create product review
//@route post  /api/products/review/:productId
//@access authorised user

exports.createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(400);
    throw new Error("Product does not exist");
  }

  const isReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user.id
  );
  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user.id) {
        (review.rating = rating), (review.comment = comment);
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avarageRatings = 0;
  product.reviews.forEach((rate) => {
    avarageRatings += rate.rating;
  });
  product.ratings = avarageRatings / product.reviews.length;
  await product.save();
  res.status(201).json({
    success: true,
    product,
  });
});

//@desc get specific product reviews
//@route post  /api/products/getProductReviews/:productId
//@access authorised user
exports.getProductAllReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(400);
    throw new Error("Product does not exist");
  }
  const Reviews = product.reviews.map((review) => {
    return {
      name: review.name,
      review: review.rating,
      comment: review.comment,
    };
  });
  res.status(200).json({
    success: true,
    Reviews,
  });
});

//@desc delete product review
//@route delete /api/products/deleteReviews/:productId
//@access authorised user

exports.deleteProductReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(400);
    throw new Error("Product does not exist");
  }

  const reviews = product.reviews.filter(
    (review) => review.user.toString() !== req.user.id
  );

  let avarageRatings = 0;
  reviews.forEach((rate) => {
    avarageRatings += rate.rating;
  });
  let ratings;
  if(reviews.length===0){
     ratings=0;
  }
  else{
     ratings = avarageRatings / reviews.length;
  }
  console.log(avarageRatings)
  

  const numOfReviews = reviews.length;
  await Product.findByIdAndUpdate(req.params.productId,{reviews,ratings,numOfReviews}, {
    reviews,
    ratings,
    numOfReviews,
  });

  const Reviews = product.reviews.map((review) => {
    return {
      name: review.name,
      review: review.rating,
      comment: review.comment,
    }
  });
  res.status(200).json({
    success: true,
    Reviews,
  });
});
