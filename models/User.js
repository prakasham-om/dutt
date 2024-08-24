const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const contactSchema = new mongoose.Schema({
  contactDetails: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  chatRoomId: mongoose.Schema.Types.ObjectId,
});

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,  // Ensure the username is stored in lowercase
  },
  bio: {
    type: String,
    min: 1,
    max: 100,
    default: "Hi there, I'm using Telegram",
  },
  avatar: {
    type: String,
    default: "https://res.cloudinary.com/dlanhtzbw/image/upload/v1675343188/Telegram%20Clone/no-profile_aknbeq.jpg",
  },
  contacts: [contactSchema],
  status: {
    online: { type: Boolean, default: true },
    lastSeen: Date,
  },
  password: {
    type: String,
    required: true,
    min: [8, "Password too short"],
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: function (givenPassword) {
        return givenPassword === this.password;
      },
      message: "Passwords do not match",
    },
  },
  chatRooms: [mongoose.Schema.Types.ObjectId],
  pinnedChatRooms: [],
  unreadMessages: [{}],
  undeliveredMessages: [{}],
});

Schema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    this.confirmPassword = undefined;  // Remove confirmPassword from saved document
  }
  next();
});

Schema.methods.checkPasswordValidity = async function (givenPassword) {
  return await bcrypt.compare(givenPassword, this.password);
};

module.exports = mongoose.model("User", Schema);
