const { PineconeClient } = require("@pinecone-database/pinecone");
const Chatbot = require("../models/Chatbot");
const User = require("../models/User");
const Dataset = require("../models/Dataset");
require("dotenv").config();

const getUsers = async (req, res) => {
  try {
    const rows = await User.find();
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id, title } = req.body;
    if (title) {
      const updateObj = {};
      if (title) {
        updateObj.title = title;
      }
      await User.updateOne({ _id: id }, { $set: updateObj });
    }
    const rows = await User.find();
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;
    await User.deleteOne({ _id: id });
    const botRows = await Chatbot.find({ userId: id });
    const botIds = [];
    if (botRows) {
      botRows.map((item) => {
        botIds.push(item._id.toString());
      });
      if (botIds) {
        await Chatbot.deleteMany({ userId: id });
        await Dataset.deleteMany({ botId: { $in: botIds } });

        const client = new PineconeClient();
        await client.init({
          apiKey: process.env.PINECONE_API_KEY,
          environment: process.env.PINECONE_ENVIRONMENT,
        });
        const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
        botIds.map(async (item) => {
          await pineconeIndex.delete1({
            namespace: item,
            deleteAll: true,
          });
        });
      }
    }

    const rows = await User.find();
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
};
