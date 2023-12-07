const { PineconeClient } = require("@pinecone-database/pinecone");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const Phone = require("../models/Phone");
const Chatbot = require("../models/Chatbot");
const Dataset = require("../models/Dataset");
const BlockList = require("../models/Blocklist");
require("dotenv").config();

// @route    GET api/user
// @desc     get all users
const getAll = async (req, res) => {
  try {
    const rows = await User.find();
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @route    GET api/user/count
// @desc     get all users' count
const getCount = async (req, res) => {
  try {
    const rows = await User.find();
    return res.status(200).json({ data: rows.length });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @route    POST api/user
// @desc     create user
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.errors[0].msg });
  }
  try {
    const { username, email, password, userType } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      username,
      email,
      password,
      userType,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // const payload = {
    //   user: {
    //     id: user._id,
    //   },
    // };

    // jwt.sign(
    //   payload,
    //   config.get("jwtSecret"),
    //   { expiresIn: "5 days" },
    //   (err, token) => {
    //     if (err) throw err;
    //     res.json({ token });
    //   }
    // );

    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @route    POST api/user/update
// @desc     Reset Password
const update = async (req, res) => {
  try {
    const { id, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(password, salt);

    const updateObj = { password: newPassword };
    await User.updateOne({ _id: id }, { $set: updateObj });
    return res.status(201).json({
      message: "User updated successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @route    POST api/user/delete
// @desc     delete user
const deleteOne = async (req, res) => {
  try {
    const { id } = req.body;
    await User.deleteOne({ _id: id });
    await Phone.deleteMany({ userId: id });
    const bots = await Chatbot.find({ userId: id });
    await Chatbot.deleteMany({ userId: id });
    await Dataset.deleteMany({ userId: id });
    await BlockList.deleteMany({ userId: id });

    if (bots) {
      const client = new PineconeClient();
      await client.init({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
      });
      const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
      bots.map(async (item) => {
        await pineconeIndex.delete1({
          namespace: item._id.toString(),
          deleteAll: true,
        });
      });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAll,
  getCount,
  create,
  update,
  deleteOne,
};
