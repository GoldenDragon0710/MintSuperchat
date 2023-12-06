const mongoose = require("mongoose");

const blocklistSchema = new mongoose.Schema(
  {
    phoneId: String,
    phone: String,
    name: String,
  },
  { timestamps: true }
);

const BlockList = mongoose.model("BlockList", blocklistSchema);
module.exports = BlockList;
