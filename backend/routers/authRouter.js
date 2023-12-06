const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check } = require("express-validator");
const authController = require("../controllers/authController");

router.get("/", auth, authController.loadUser);
router.post(
  "/",
  check("email", "Please include a valid email").isEmail(),
  authController.login
);

module.exports = router;
