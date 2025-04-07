const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");

const uploadImage = require("../middleware/imagesUploader");
const {
  createProductFeature,
  getAllProductFeature,
  getSingleProductFeature,
  updateProductFeature,
  deleteProductFeature,
} = require("../controllers/productFeatureController");

const router = express.Router();

router.post(
  "/create",
  uploadImage.single("image"),
  verifyAdmin,
  createProductFeature
);
router.get("/all/:id", getAllProductFeature);
router.get("/:id", getSingleProductFeature);
router.put(
  "/update/:id",
  verifyAdmin,
  uploadImage.single("image"),
  updateProductFeature
);
router.delete("/delete/:id", verifyAdmin, deleteProductFeature);

module.exports = router;
