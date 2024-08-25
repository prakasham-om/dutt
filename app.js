const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const authRouter = require("./routers/authRouter");
const contactsRouter = require("./routers/contactsRouter");
const chatRoomRouter = require("./routers/chatRoomRouter");
const profileRouter = require("./routers/profileRouter");
const uploadRouter = require("./routers/uploadRouter");
const ReqError = require("./utilities/ReqError");
const errorController = require("./controllers/errorController");

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({
  origin: function(origin, callback) {
    // Array of allowed origins
    const allowedOrigins = ['https://dutt.vercel.app', 'https://anotherdomain.com'];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Routes
app.use("/api/user", authRouter);

// Protector
app.use("/api/*", (req, res, next) => {
  if (!req.cookies.userId)
    return next(new ReqError(400, "You are not logged in"));

  next();
});

app.use("/api/contacts", contactsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/chatRoom", chatRoomRouter);
app.use("/api/upload", uploadRouter);

// Error handle middleware
app.use(errorController);

module.exports = app;
