const { PineconeClient } = require("@pinecone-database/pinecone");
const BlockList = require("../models/Blocklist");
require("dotenv").config();

const getBlockUsers = async (req, res) => {
  try {
    const { projectID } = req.body;
    const rows = await BlockList.find({ userID: projectID });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addBlockUser = async (req, res) => {
  try {
    const { phone, name, projectID } = req.body;
    await BlockList.create({ name: name, phone: phone, userID: projectID });
    const rows = await BlockList.find({ userID: projectID });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateBlockUser = async (req, res) => {
  try {
    const { id, name, phone, projectID } = req.body;
    if (name || phone) {
      const updateObj = {};
      if (name) {
        updateObj.name = name;
      }
      if (phone) {
        updateObj.phone = phone;
      }
      await BlockList.updateOne({ _id: id }, { $set: updateObj });
    }
    const rows = await BlockList.find({ userID: projectID });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteBlockUser = async (req, res) => {
  try {
    const { id, projectID } = req.body;
    await BlockList.deleteOne({ _id: id });
    const rows = await BlockList.find({ userID: projectID });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getBlockUsers,
  addBlockUser,
  updateBlockUser,
  deleteBlockUser,
};
