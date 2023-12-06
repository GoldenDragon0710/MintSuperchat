const { PineconeClient } = require("@pinecone-database/pinecone");
const Chatbot = require("../models/Chatbot");
const Phone = require("../models/Phone");
const Dataset = require("../models/Dataset");
require("dotenv").config();

const get = async (req, res) => {
  try {
    const { phoneId } = req.body;
    const data = {};
    if (phoneId) {
      data.phoneId = phoneId;
    }
    const rows = await Chatbot.find(data);
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getCount = async (req, res) => {
  try {
    const rows = await Chatbot.find();
    return res.status(200).json({ data: rows.length });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const create = async (req, res) => {
  try {
    const { phoneId, title } = req.body;
    await Chatbot.create({ phoneId: phoneId, title: title, active: false });
    const botCountrow = await Phone.findById(phoneId);
    await Phone.updateOne(
      { _id: phoneId },
      { $set: { botCount: botCountrow.botCount + 1 } }
    );
    const rows = await Chatbot.find({ phoneId: phoneId });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { id, phoneId, active } = req.body;
    await Chatbot.updateMany({ phoneId: phoneId }, { $set: { active: false } });
    if (phoneId || active) {
      const updateObj = {};
      if (active) {
        updateObj.active = active;
      }
      await Chatbot.updateOne({ _id: id }, { $set: updateObj });
    }
    const rows = await Chatbot.find({ phoneId: phoneId });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteOne = async (req, res) => {
  try {
    const { id, phoneId } = req.body;
    const row = await Phone.findById(phoneId);
    await Phone.updateOne(
      { _id: phoneId },
      { $set: { botCount: row.botCount - 1 } }
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

    const rows = await Chatbot.find({ phoneId: phoneId });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get,
  getCount,
  create,
  update,
  deleteOne,
};
