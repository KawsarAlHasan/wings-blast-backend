const express = require("express");

const verifyAdmin = require("../../middleware/verifyAdmin");

const uploadImage = require("../../middleware/imagesUploader");
const {
  createSauce,
  getAllSauce,
  getSingleSauce,
  updateSauce,
  deleteSauce,
} = require("../../controllers/foodDetailsFeature/sauceController");

const router = express.Router();

router.post("/create", uploadImage.single("image"), verifyAdmin, createSauce);
router.get("/all", getAllSauce);
router.get("/:id", getSingleSauce);
router.put(
  "/update/:id",
  verifyAdmin,
  uploadImage.single("image"),
  updateSauce
);
router.delete("/delete/:id", verifyAdmin, deleteSauce);

module.exports = router;
