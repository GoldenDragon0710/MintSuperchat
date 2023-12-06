const mongoose = require("mongoose");

const phoneSchema = new mongoose.Schema(
  {
    title: String,
    phone: String,
    userId: String,
    botCount: Number,
    delflag: Boolean,
  },
  { timestamps: true }
);

const Phone = mongoose.model("Phone", phoneSchema);
module.exports = Phone;
