const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");
const {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const uploadImage = require("../middleware/imagesUploader");

const router = express.Router();

router.post(
  "/create",
  uploadImage.single("category_image"),
  verifyAdmin,
  createCategory
);
router.get("/all", getAllCategory);
router.put("/update/:id", uploadImage.single("category_image"), updateCategory);
router.delete("/delete/:id", deleteCategory);

module.exports = router;
