const express = require("express");
const chatbotController = require("../controllers/chatbotController");
const router = express.Router();

router.get("/count", chatbotController.getCount);
router.post("/", chatbotController.get);
router.post("/create", chatbotController.create);
router.post("/update", chatbotController.update);
router.post("/delete", chatbotController.deleteOne);

module.exports = router;
