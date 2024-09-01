const User = require("../models/User");
const ReqError = require("../utilities/ReqError");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../utilities/catchAsyncError");

// Function to sign a JWT token
const signToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN, // Make sure this value is in a valid format, e.g., '1d'
  });
};

// Function to assign JWT token to cookies
const assignTokenToCookie = (user, res, statusCode) => {
  const token = signToken(user);

  const cookieOptions = {
    httpOnly: true, // Ensures the cookie is not accessible via JavaScript
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN, 10) * 24 * 60 * 60 * 1000 // Calculate expiration based on days
    ),
  };

  // Setting cookies
  res.cookie("telegramToken", token, cookieOptions);
  res.cookie("userId", user._id.toString(), cookieOptions); // Add same cookie options for consistency

  user.password = undefined; // Do not send password in response

  // Send response with token and user data
  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user,
    },
  });
};

// Login handler
exports.login = catchAsyncError(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) return next(new ReqError(400, "Username and Password needed"));

  const foundUser = await User.findOne({ username });

  if (!foundUser) return next(new ReqError(400, "Username or Password incorrect"));

  const passwordGivenCorrect = await foundUser.checkPasswordValidity(password, foundUser.password);

  if (!passwordGivenCorrect) return next(new ReqError(400, "Username or Password incorrect"));

  assignTokenToCookie(foundUser, res, 200);
});

// Register handler
exports.register = catchAsyncError(async (req, res, next) => {
  const { name, username, password, confirmPassword } = req.body;

  if (!name || !username || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  const newUser = await User.create({ name, username, password });

  assignTokenToCookie(newUser, res, 201);
});
