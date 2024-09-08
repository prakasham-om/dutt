const User = require("../models/User");
const ReqError = require("../utilities/ReqError");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../utilities/catchAsyncError");

const signToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const assignTokenToCookie = (user, res, statusCode) => {
  const token = signToken(user);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only set secure in production
    sameSite: 'None', // Necessary for cross-site cookies
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
  };

  res.cookie("telegramToken", token, cookieOptions);
  res.cookie("userId", user._id, cookieOptions); // Apply the same cookie options to all cookies

  user.password = undefined;

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

  // Validate input
  if (!username || !password) return next(new ReqError(400, "Username and Password are required"));

  const foundUser = await User.findOne({ username });

  if (!foundUser) return next(new ReqError(400, "Username or Password incorrect"));

  const passwordGivenCorrect = await foundUser.checkPasswordValidity(password, foundUser.password);

  if (!passwordGivenCorrect) return next(new ReqError(400, "Username or Password incorrect"));

  assignTokenToCookie(foundUser, res, 200);
});

exports.register = catchAsyncError(async (req, res, next) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) return next(new ReqError(400, "Username and Password are required"));

  const newUser = await User.create(req.body);

  assignTokenToCookie(newUser, res, 201);
});
