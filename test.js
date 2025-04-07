const express = require("express");
const { test } = require("./testController");
const router = express.Router();

router.get("/", test);

module.exports = router;
