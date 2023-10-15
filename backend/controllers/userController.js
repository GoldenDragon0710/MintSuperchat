const User = require("../models/User");

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
    const { id, active, title } = req.body;
    if (active || title) {
      const updateObj = {};
      if (active) {
        updateObj.active = active;
      }
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
