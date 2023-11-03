const express = require("express");
const chatbotController = require("../controllers/chatbotController");
const userController = require("../controllers/userController");
const datasetController = require("../controllers/datasetController");
const blocklistController = require("../controllers/blocklistController");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const DIR = "./uploads/";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "application/pdf" ||
      file.mimetype == "text/plain" ||
      file.mimetype == "text/csv" ||
      file.mimetype == "application/msword" ||
      file.mimetype ==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype == "application/vnd.ms-excel" ||
      file.mimetype ==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error(
          "Only .pdf, .txt, .doc, .docx, .csv, .xls and .xlsx format allowed!"
        )
      );
    }
  },
});

router.post("/getsitemap", datasetController.getSitemap);
router.post("/getQRCode", datasetController.getQRCode);
router.post("/getDataset", datasetController.getDataset);
router.post("/deleteDataset", datasetController.deleteDataset);
router.post("/train", upload.array("files"), datasetController.trainbot);

router.get("/getUsers", userController.getUsers);
router.post("/updateUser", userController.updateUser);
router.post("/deleteUser", userController.deleteUser);

router.post("/getChatbots", chatbotController.getChatbots);
router.post("/addChatbot", chatbotController.addChatbot);
router.post("/updateChatbot", chatbotController.updateChatbot);
router.post("/deleteChatbot", chatbotController.deleteChatbot);

router.get("/getBlockUsers", blocklistController.getBlockUsers);
router.post("/addBlockUser", blocklistController.addBlockUser);
router.post("/updateBlockUser", blocklistController.updateBlockUser);
router.post("/deleteBlockUser", blocklistController.deleteBlockUser);

module.exports = router;
