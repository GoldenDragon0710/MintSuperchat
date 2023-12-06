const express = require("express");
const blocklistController = require("../controllers/blocklistController");
const router = express.Router();

router.post("/", blocklistController.get);
router.post("/create", blocklistController.create);
router.post("/update", blocklistController.update);
router.post("/delete", blocklistController.deleteOne);

module.exports = router;
