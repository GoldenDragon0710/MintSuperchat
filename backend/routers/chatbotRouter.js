const express = require("express");
const chatbotController = require("../controllers/chatbotController");
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
          "Only .pdf, .txt, .doc, .docx, .xls and .xlsx format allowed!"
        )
      );
    }
  },
});

router.post("/getsitemap", chatbotController.getSitemap);
router.get("/getDataset", chatbotController.getDataset);
router.post("/deleteDataset", chatbotController.deleteDataset);
router.post("/wamsg", chatbotController.getReply);
router.post("/train", upload.array("files"), chatbotController.trainbot);

module.exports = router;
