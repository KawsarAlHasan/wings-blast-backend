const express = require("express");

const verifyAdmin = require("../../middleware/verifyAdmin");

const uploadImage = require("../../middleware/imagesUploader");
const {
  createDip,
  getAllDip,
  getSingleDip,
  updateDip,
  deleteDip,
  updatedipStatus,
} = require("../../controllers/foodDetailsFeature/dipController");

const router = express.Router();

router.post("/create", uploadImage.single("image"), verifyAdmin, createDip);
router.get("/all", getAllDip);
router.get("/:id", getSingleDip);
router.put("/update/:id", verifyAdmin, uploadImage.single("image"), updateDip);
router.put("/status/:id", updatedipStatus);
router.delete("/delete/:id", verifyAdmin, deleteDip);

module.exports = router;
