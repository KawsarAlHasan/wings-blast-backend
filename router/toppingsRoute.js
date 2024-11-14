const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");

const uploadImage = require("../middleware/imagesUploader");
const {
  createToppings,
  getAllToppings,
  getSingleToppings,
  updateToppings,
  deleteToppings,
} = require("../controllers/toppingsController");

const router = express.Router();

router.post(
  "/create",
  uploadImage.single("image"),
  verifyAdmin,
  createToppings
);
router.get("/all", getAllToppings);
router.get("/:id", getSingleToppings);
router.put(
  "/update/:id",
  verifyAdmin,
  uploadImage.single("image"),
  updateToppings
);
router.delete("/delete/:id", verifyAdmin, deleteToppings);

module.exports = router;
