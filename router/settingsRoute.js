const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");

const {
  getDeliveryFee,
  updateDeliveryFee,
  getTax,
  updateTax,
  updateFooterSettings,
  getFooterSettings,
} = require("../controllers/settingsController");

const router = express.Router();

router.get("/delevery-fee", getDeliveryFee);
router.put("/delevery-fee/update/:id", verifyAdmin, updateDeliveryFee);

router.get("/tax", getTax);
router.put("/tax/update/:id", verifyAdmin, updateTax);

router.get("/:type", getFooterSettings);
router.put("/update/:type", verifyAdmin, updateFooterSettings);

module.exports = router;
