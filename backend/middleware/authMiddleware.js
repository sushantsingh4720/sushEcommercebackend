const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
exports.isAuthenticatedUser = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    res.status(401);
    throw new Error("Please login or signup to access this resource");
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);
  next();
});

exports.authorizationRoles=(...roles)=>{
  return (req,res,next)=>{
    if(!roles.includes(req.user.role)){
      res.status(400)
      throw new Error(`Role:${req.user.role} is not allowed to access this resource`)
    }
    next()
  }
}