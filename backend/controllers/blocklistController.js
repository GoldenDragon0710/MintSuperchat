const BlockList = require("../models/Blocklist");

const get = async (req, res) => {
  try {
    const { phoneId } = req.body;
    const rows = await BlockList.find({ phoneId: phoneId });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const create = async (req, res) => {
  try {
    const { phone, name, phoneId } = req.body;
    await BlockList.create({
      name: name,
      phone: phone,
      phoneId: phoneId,
    });
    const rows = await BlockList.find({ phoneId: phoneId });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { id, name, phone, phoneId } = req.body;
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
    const rows = await BlockList.find({ phoneId: phoneId });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteOne = async (req, res) => {
  try {
    const { id, phoneId } = req.body;
    await BlockList.deleteOne({ _id: id });
    const rows = await BlockList.find({ phoneId: phoneId });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  get,
  create,
  update,
  deleteOne,
};
