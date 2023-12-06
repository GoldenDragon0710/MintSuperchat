const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const { check } = require("express-validator");

router.get("/", userController.getAll);
router.get("/count", userController.getCount);
router.post(
  "/",
  check("email", "Please include a valid email").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
  userController.create
);
router.post("/update", userController.update);
router.post("/delete", userController.deleteOne);

module.exports = router;
