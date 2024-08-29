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
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    sameSite: 'None',
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN,10) * 24 * 60 * 60 * 1000
    ),
  };

  res.cookie("telegramToken", token, cookieOptions);
  res.cookie("userId", user._id);

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
  // Takes in username and password
  const { username, password } = req.body;

  // If there's no details given
  if (!username) return next(new ReqError(400, "Username and Password needed"));

  const foundUser = await User.findOne({ username });

  //   If username does not exist
  if (!foundUser)
    return next(new ReqError(400, "Username or Password incorrect"));

  const passwordGivenCorrect = await foundUser.checkPasswordValidity(
    password,
    foundUser.password
  );

  //   If given password is incorrect
  if (!passwordGivenCorrect)
    return next(new ReqError(400, "Username or Password incorrect"));

  assignTokenToCookie(foundUser, res, 200);
});

exports.register = catchAsyncError(async (req, res, next) => {
  const { name, username, password, confirmPassword } = req.body;

  // Validate input
  if (!name || !username || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // Check if username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  // Create new user
  const newUser = await User.create({ name, username, password });

  // Assign token to cookie and send response
  assignTokenToCookie(newUser, res, 201);
});

