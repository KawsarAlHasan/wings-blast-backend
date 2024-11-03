const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");

const uploadImage = require("../middleware/imagesUploader");
const {
  createFoodDetails,
  getAllFoodDetails,
  getSingleFoodDetails,
  deleteFoodDetails,
} = require("../controllers/foodDeatailsController");

const router = express.Router();

router.post(
  "/create",
  uploadImage.single("image"),
  verifyAdmin,
  createFoodDetails
);
router.get("/all", getAllFoodDetails);
router.get("/:id", getSingleFoodDetails);
// router.put(
//   "/update/:id",
//   verifyAdmin,
//   uploadImage.single("image"),
//   updateflavor
// );
router.delete("/delete/:id", verifyAdmin, deleteFoodDetails);

module.exports = router;
