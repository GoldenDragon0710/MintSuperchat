const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    email: String,
    userType: Boolean,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
