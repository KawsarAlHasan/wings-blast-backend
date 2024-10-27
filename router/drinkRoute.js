const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");

const uploadImage = require("../middleware/imagesUploader");
const {
  createDrink,
  getAllDrink,
  getSingleDrink,
  updateDrink,
  deleteDrink,
} = require("../controllers/drinkController");

const router = express.Router();

router.post("/create", uploadImage.single("image"), verifyAdmin, createDrink);
router.get("/all", getAllDrink);
router.get("/:id", getSingleDrink);
router.put(
  "/update/:id",
  verifyAdmin,
  uploadImage.single("image"),
  updateDrink
);
router.delete("/delete/:id", verifyAdmin, deleteDrink);

module.exports = router;
