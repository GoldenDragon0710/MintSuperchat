const { PineconeClient } = require("@pinecone-database/pinecone");
const Chatbot = require("../models/Chatbot");
const Phone = require("../models/Phone");
const Dataset = require("../models/Dataset");
require("dotenv").config();

const get = async (req, res) => {
  try {
    const { userId } = req.body;
    const data = {};
    if (userId) {
      data.userId = userId;
    }
    const rows = await Phone.find(data);
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getCount = async (req, res) => {
  try {
    const rows = await Phone.find();
    return res.status(200).json({ data: rows.length });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { id, title } = req.body;
    if (title) {
      const updateObj = {};
      if (title) {
        updateObj.title = title;
      }
      await Phone.updateOne({ _id: id }, { $set: updateObj });
    }
    const rows = await Phone.find();
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteOne = async (req, res) => {
  try {
    const { id } = req.body;
    await Phone.deleteOne({ _id: id });
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

    const rows = await Phone.find();
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const initDB = async () => {
  try {
    await Phone.updateMany({}, { $set: { delflag: true } });
    console.log("Database has been initialized");
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  get,
  getCount,
  update,
  deleteOne,
  initDB,
};
