const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validationResult } = require("express-validator");
require("dotenv").config();

// @route    GET api/user
// @desc     get all users
// @access   Public
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
// @access   Public
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
// @access   Public
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
// @access   Public
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
// @access   Public
const deleteOne = async (req, res) => {
  try {
    const { id } = req.body;
    await User.deleteOne({ _id: id });

    const rows = await User.find();
    return res.status(200).json({ data: rows });
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
