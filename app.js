const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const authRouter = require("./routers/authRouter");
const contactsRouter = require("./routers/contactsRouter");
const chatRoomRouter = require("./routers/chatRoomRouter");
const profileRouter = require("./routers/profileRouter");
const uploadRouter = require("./routers/uploadRouter");
const ReqError = require("./utilities/ReqError");
const errorController = require("./controllers/errorController");

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors());

// Routes
app.use("/api/user", authRouter);

// Middleware to protect routes
app.use("/api/*", (req, res, next) => {
  // Check for the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ReqError(401, "Unauthorized: No token provided"));
  }

  // Extract the token
  const token = authHeader.split(" ")[1];

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(new ReqError(401, "Unauthorized: Invalid token"));
    }

    // Attach user data to the request object
    req.user = decoded;
    next();
  });
});

// Public routes
app.use("/api/contacts", contactsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/chatRoom", chatRoomRouter);
app.use("/api/upload", uploadRouter);

// Error handling middleware
app.use(errorController);

module.exports = app;
