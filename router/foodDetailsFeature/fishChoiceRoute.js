const express = require("express");

const verifyAdmin = require("../../middleware/verifyAdmin");

const uploadImage = require("../../middleware/imagesUploader");
const {
  createFishChoice,
  getAllFishChoice,
  getSingleFishChoice,
  updateFishChoice,
  deleteFishChoice,
} = require("../../controllers/foodDetailsFeature/fishChoiceController");

const router = express.Router();

router.post(
  "/create",
  uploadImage.single("image"),
  verifyAdmin,
  createFishChoice
);
router.get("/all", getAllFishChoice);
router.get("/:id", getSingleFishChoice);
router.put(
  "/update/:id",
  verifyAdmin,
  uploadImage.single("image"),
  updateFishChoice
);
router.delete("/delete/:id", verifyAdmin, deleteFishChoice);

module.exports = router;
