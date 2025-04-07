const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");

const uploadImage = require("../middleware/imagesUploader");
const {
  createSide,
  getAllSide,
  getSingleSide,
  updateSide,
  deleteSide,
} = require("../controllers/sideController");

const router = express.Router();

router.post("/create", uploadImage.single("image"), verifyAdmin, createSide);
router.get("/all", getAllSide);
router.get("/:id", getSingleSide);
router.put("/update/:id", verifyAdmin, uploadImage.single("image"), updateSide);
router.delete("/delete/:id", verifyAdmin, deleteSide);

module.exports = router;
