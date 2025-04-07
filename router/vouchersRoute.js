const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");
const {
  getBirthdayVouchers,
  updateVouchers,
} = require("../controllers/vouchersController");
const uploadImage = require("../middleware/imagesUploader");

const router = express.Router();

router.get("/", getBirthdayVouchers);
router.put("/:vouchers_name", uploadImage.single("image"), updateVouchers);

module.exports = router;
