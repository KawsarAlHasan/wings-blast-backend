const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");

const uploadImage = require("../middleware/imagesUploader");
const {
  createBeverage,
  getAllBeverage,
  getSingleBeverage,
  updateBeverage,
  deletebeverage,
} = require("../controllers/beverageController");

const router = express.Router();

router.post(
  "/create",
  uploadImage.single("image"),
  verifyAdmin,
  createBeverage
);
router.get("/all", getAllBeverage);
router.get("/:id", getSingleBeverage);
router.put(
  "/update/:id",
  verifyAdmin,
  uploadImage.single("image"),
  updateBeverage
);
router.delete("/delete/:id", verifyAdmin, deletebeverage);

module.exports = router;
