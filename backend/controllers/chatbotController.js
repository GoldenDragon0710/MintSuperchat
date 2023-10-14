const Chatbot = require("../models/Chatbot");
const User = require("../models/User");

const getChatbots = async (req, res) => {
  try {
    const { userId } = req.body;
    const rows = await Chatbot.find({ userId: userId });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addChatbot = async (req, res) => {
  try {
    const { userId, title } = req.body;
    await Chatbot.create({ userId: userId, title: title });
    const botCountrow = await User.findById(userId);
    await User.updateOne(
      { _id: userId },
      { $set: { botCount: botCountrow.botCount + 1 } }
    );
    const rows = await Chatbot.find({ userId: userId });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateChatbot = async (req, res) => {
  try {
    const { id, userId, title } = req.body;
    if (userId || title) {
      const updateObj = {};
      if (userId) {
        updateObj.userId = userId;
      }
      if (title) {
        updateObj.title = title;
      }
      await User.updateOne({ _id: id }, { $set: updateObj });
    }
    const rows = await Chatbot.find({ userId: userId });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteChatbot = async (req, res) => {
  try {
    const { id, userId } = req.body;
    const userRow = await User.findById(userId);
    await User.updateOne(
      { _id: userId },
      { $set: { botCount: userRow.botCount - 1 } }
    );
    await Chatbot.deleteOne({ _id: id });
    const rows = await Chatbot.find({ userId: userId });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getChatbots,
  addChatbot,
  updateChatbot,
  deleteChatbot,
};
