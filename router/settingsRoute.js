const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");

const uploadImage = require("../middleware/imagesUploader");
const {
  getDeliveryFee,
  updateDeliveryFee,
  getTax,
  updateTax,
  createBanner,
  getAllBanner,
  updateBanner,
  deleteBanner,
  updateFooterSettings,
  getFooterSettings,
} = require("../controllers/settingsController");

const router = express.Router();

router.get("/delevery-fee", getDeliveryFee);
router.put("/delevery-fee/update/:id", updateDeliveryFee);

router.get("/tax", getTax);
router.put("/tax/update/:id", updateTax);

router.get("/:type", getFooterSettings);
router.put("/update/:type", updateFooterSettings);

router.post("/banner/create", uploadImage.single("image"), createBanner);
router.get("/banner", getAllBanner);
router.put("/banner/update/:id", uploadImage.single("image"), updateBanner);
router.delete("/banner/delete/:id", deleteBanner);

module.exports = router;
