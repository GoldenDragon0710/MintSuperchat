const express = require("express");
const datasetController = require("../controllers/datasetController");
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
      file.mimetype == "application/xml" ||
      file.mimetype == "text/xml" ||
      file.mimetype == "application/rss+xml" ||
      file.mimetype == "application/atom+xml"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error("Only .pdf, .txt, .doc, .docx, .xml format allowed!")
      );
    }
  },
});

router.post("/", datasetController.getDataset);
router.post("/getsitemapURL", datasetController.getSitemapURL);
router.post("/getsitemapXML", datasetController.getSitemapXML);
router.post("/getQRCode", datasetController.getQRCode);
router.post("/delete", datasetController.deleteDataset);
router.post("/train", upload.array("files"), datasetController.trainbot);

module.exports = router;
