const express = require("express");
const { getAllUserVoucher } = require("../controllers/userVouchersController");

const router = express.Router();

router.get("/", getAllUserVoucher);

module.exports = router;
