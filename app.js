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

// CORS Configuration
const corsOptions = {
  origin: 'https://dutt.vercel.app', // Replace with your frontend URL
  methods: 'GET,POST,PUT,DELETE',
  credentials: true, // Allow cookies to be sent and received
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// Routes
app.use("/api/user", authRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/chatRoom", chatRoomRouter);
app.use("/api/upload", uploadRouter);

// Protector Middleware
// app.use("/api/*", (req, res, next) => {
//   if (!req.cookies.userId) return next(new ReqError(400, "You are not logged in"));
//   next();
// });

// Error Handling Middleware
app.use(errorController);

module.exports = app;
