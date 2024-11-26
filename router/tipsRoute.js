const express = require("express");
const { createTips, getAllTips } = require("../controllers/tipsController");

const router = express.Router();

router.post("/create", createTips);
router.get("/", getAllTips);

module.exports = router;
