const mongoose = require("mongoose");

const chatbotSchema = new mongoose.Schema(
  {
    userId: String,
    title: String,
    active: Boolean,
  },
  { timestamps: true }
);

const Chatbot = mongoose.model("Chatbot", chatbotSchema);
module.exports = Chatbot;
