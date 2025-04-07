const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");

const uploadImage = require("../middleware/imagesUploader");
const {
  createFoodDetails,
  getAllFoodDetails,
  getSingleFoodDetails,
  deleteFoodDetails,
  updateFoodDetails,
  foodDetailStatus,
  getAllFoodDetailsForUser,
} = require("../controllers/foodDeatailsController");

const router = express.Router();

router.post(
  "/create",
  uploadImage.single("image"),
  verifyAdmin,
  createFoodDetails
);
router.get("/", getAllFoodDetailsForUser);
router.get("/all", getAllFoodDetails);
router.get("/:id", getSingleFoodDetails);
router.put(
  "/update/:id",
  verifyAdmin,
  uploadImage.single("image"),
  updateFoodDetails
);
router.delete("/delete/:id", verifyAdmin, deleteFoodDetails);
router.put("/status/:id", foodDetailStatus);

module.exports = router;
