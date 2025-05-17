const express = require("express");
const {
  updateGlobalStatus,
  getGlobalDataFetch,
} = require("../controllers/globalController");

const router = express.Router();

router.get("/:table", getGlobalDataFetch);
router.put("/status-update", updateGlobalStatus);

module.exports = router;
