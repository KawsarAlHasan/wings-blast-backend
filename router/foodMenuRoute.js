const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");

const uploadImage = require("../middleware/imagesUploader");
const {
  createMenuFood,
  getAllFoodMenu,
  updateFoodMenu,
  deleteFoodMenu,
  getSingleFoodMenu,
  getAllFoodMenuForAdmin,
} = require("../controllers/foodMenuController");

const router = express.Router();

router.post(
  "/create",
  uploadImage.single("image"),
  verifyAdmin,
  createMenuFood
);
router.get("/all", getAllFoodMenu);
router.get("/admin", getAllFoodMenuForAdmin);
router.get("/:id", getSingleFoodMenu);
router.put("/update/:id", uploadImage.single("image"), updateFoodMenu);
router.delete("/delete/:id", deleteFoodMenu);

module.exports = router;
