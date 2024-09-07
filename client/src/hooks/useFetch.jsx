const express = require("express");
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
app.use(cors());

// Routes
app.use("/api/user", authRouter);

// Middleware to protect routes
app.use("/api/*", (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ReqError(401, "Unauthorized: No token provided"));
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(new ReqError(401, "Unauthorized: Invalid token"));
    }

    req.user = decoded;
    next();
  });
});

app.use("/api/contacts", contactsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/chatRoom", chatRoomRouter);
app.use("/api/upload", uploadRouter);

// Error handling middleware
app.use(errorController);

module.exports = app;
