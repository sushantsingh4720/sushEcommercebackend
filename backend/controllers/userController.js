const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { read } = require("fs");
//@desc user register
//@route post  /api/users/register
//@access any one can register

exports.userRegister = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is user avatar",
      url: "avatar.png",
    },
  });
  sendToken(user, 201, res);
});

//@desc user login
//@route post  /api/users/login
//@access

exports.userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(403);
    throw new Error("Please enter email and password");
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
  sendToken(user, 200, res);
});

//@desc user logout
//@route post  /api/users/logout

exports.userLogout = asyncHandler(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
});

//@desc user Forgot Password
//@route post /api/users/forgotpassword
exports.userForgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  //Get ResetPassword Token
  const resetToken = user.getRestPasswordToken();

  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/api/users/forgotpassword/${resetToken}`;

  const message = `Your password reset token is:- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Sushant E-commerce password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      meassage: `Email sent to ${user.email} successfully `,
    });
  } catch (error) {
    (user.resetPasswordToken = undefined),
      (user.resetPasswordExpire = undefined);
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error(error.message);
  }
});
//@desc user Forgot Password
//@route post /api/users/forgotpassword/`${resetToken}`

exports.userResetPassword = asyncHandler(async (req, res) => {
  //token Hashing
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400);
    throw new Error("Reset password Token is invalid or has been expired");
  }
  if (!req.body.password || !req.body.confirmPassword) {
    res.status(400);
    throw new Error("Enter the password and confirmPassword both");
  }
  console.log(req.body.password);
  console.log(req.body.confirmPassword);
  if (req.body.password !== req.body.confirmPassword) {
    res.status(400);
    throw new Error("Password does not matched");
  }
  user.password = req.body.password;
  (user.resetPasswordToken = undefined), (user.resetPasswordExpire = undefined);
  await user.save();
  sendToken(user, 200, res);
});

//@desc user details
//@route post  /api/users/me
//@access authenticate user can access

exports.getUserDetais = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

//@desc user update password
//@route post  /api/users/password/update
//@access autherised user can access

exports.updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(
    req.body.oldPassword,
    user.password
  );
  if (!isPasswordMatched) {
    res.status(400);
    throw new Error(
      "Old password does not correct Please enter the correct password"
    );
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    res.status(400);
    throw new Error("Password does not match");
  }
  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

//@desc user update profile
//@route put /api/users/me/updateProfile
//@access autherised user can access
exports.updateProfile = asyncHandler(async (req, res) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  if (!newUserData.name || !newUserData.email) {
    res.status(400);
    throw new Error("Enter email and name");
  }

  //profile avatar will be update later

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//@desc  get all users
//@route put /api/users/admin/users
//@access only admin can access

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//@desc  get specific users details
//@route put /api/users/admin/user/:id
//@access only admin can access

exports.getSpecificUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(400);
    throw new Error("user does not exist");
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//@desc  updata user role
//@route put /api/users/admin/user/:id
//@access only admin can access

exports.updateUserRole = asyncHandler(async (req, res) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  if (!newUserData.name || !newUserData.email || !newUserData.role) {
    res.status(400);
    throw new Error("Enter email and name and role");
  }

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//@desc  delete user
//@route put /api/users/admin/user/:id
//@access only admin can access

exports.deleteSpecificUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(400);
    throw new Error("user does not exist");
  }
  await user.remove();
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
