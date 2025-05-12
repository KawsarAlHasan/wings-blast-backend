const express = require("express");
const { updateGlobalStatus } = require("../controllers/globalController");

const router = express.Router();

router.put("/status-update", updateGlobalStatus);

module.exports = router;
