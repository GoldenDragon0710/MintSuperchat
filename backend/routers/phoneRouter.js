const express = require("express");
const phoneController = require("../controllers/phoneController");
const router = express.Router();

router.get("/count", phoneController.getCount);
router.post("/", phoneController.get);
router.post("/update", phoneController.update);
router.post("/delete", phoneController.deleteOne);

module.exports = router;
