const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");

const uploadImage = require("../middleware/imagesUploader");
const {
  createDrinkName,
  getAllDrinksName,
  getSingleDrinkName,
  deleteDrinkName,
  updateDrinkName,
} = require("../controllers/drinkNameController");

const router = express.Router();

router.post(
  "/create",
  uploadImage.single("image"),
  verifyAdmin,
  createDrinkName
);
router.put(
  "/update/:id",
  uploadImage.single("image"),
  verifyAdmin,
  updateDrinkName
);

router.get("/all", getAllDrinksName);
router.get("/:id", getSingleDrinkName);
router.delete("/delete/:id", deleteDrinkName);

module.exports = router;
