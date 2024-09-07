const User = require("../models/User");
const ReqError = require("../utilities/ReqError");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../utilities/catchAsyncError");

const signToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d', // Default to 7 days if not specified
  });
};

const assignTokenToCookie = (user, res, statusCode) => {
  const token = signToken(user);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Secure flag for production
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_EXPIRES_IN, 10) || 7) * 24 * 60 * 60 * 1000 // Default to 7 days if not specified
    ),
    path: '/',
  };

  res.cookie("telegramToken", token, cookieOptions);
  res.cookie("userId", user._id.toString(), cookieOptions); // Ensure userId is a string

  user.password = undefined; // Hide sensitive data

  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user,
    },
  });
};

exports.login = catchAsyncError(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new ReqError(400, "Username and Password are required"));
  }

  const foundUser = await User.findOne({ username });

  if (!foundUser) {
    return next(new ReqError(400, "Username or Password is incorrect"));
  }

  const passwordIsValid = await foundUser.checkPasswordValidity(password, foundUser.password);

  if (!passwordIsValid) {
    return next(new ReqError(400, "Username or Password is incorrect"));
  }

  assignTokenToCookie(foundUser, res, 200);
});

exports.register = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create(req.body);
  assignTokenToCookie(newUser, res, 201);
});
