const mongoose = require("mongoose");

const chatbotSchema = new mongoose.Schema(
  {
    name: String,
    trainflag: Boolean,
  },
  { timestamps: true }
);

const Chatbot = mongoose.model("Chatbot", chatbotSchema);
module.exports = Chatbot;
