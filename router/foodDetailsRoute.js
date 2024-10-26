const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");

const uploadImage = require("../middleware/imagesUploader");
const { createFoodDetails } = require("../controllers/foodDeatailsController");

const router = express.Router();

router.post(
  "/create",
  uploadImage.single("image"),
  verifyAdmin,
  createFoodDetails
);
// router.get("/all", getAllFlavor);
// router.get("/:id", getSingleFlavor);
// router.put(
//   "/update/:id",
//   verifyAdmin,
//   uploadImage.single("image"),
//   updateflavor
// );
// router.delete("/delete/:id", verifyAdmin, deleteflavor);

module.exports = router;
