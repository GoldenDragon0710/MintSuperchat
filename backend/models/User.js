const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    title: String,
    phone: String,
    botCount: Number,
    active: Boolean,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
