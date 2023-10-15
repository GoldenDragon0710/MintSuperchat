const { PineconeClient } = require("@pinecone-database/pinecone");
const Chatbot = require("../models/Chatbot");
const User = require("../models/User");
const Dataset = require("../models/Dataset");
require("dotenv").config();

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
    await Chatbot.create({ userId: userId, title: title, active: false });
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
    const { id, userId, title, active, currentActiveId } = req.body;
    if (userId || title || active) {
      const updateObj = {};
      if (title) {
        updateObj.title = title;
      }
      if (active) {
        updateObj.active = active;
      }
      await Chatbot.updateOne({ _id: id }, { $set: updateObj });
    }
    if (currentActiveId) {
      await Chatbot.updateOne(
        { _id: currentActiveId },
        { $set: { active: false } }
      );
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
    await Dataset.deleteMany({ botId: id });

    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
    await pineconeIndex.delete1({ namespace: id, deleteAll: true });

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
