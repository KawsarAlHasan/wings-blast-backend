const express = require("express");
const {
  createPayment,
  executePayment,
} = require("../controllers/paypalController");

const router = express.Router();

router.post("/create", createPayment);
router.post("/execute", executePayment);

module.exports = router;
