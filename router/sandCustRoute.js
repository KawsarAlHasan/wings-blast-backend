const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");

const uploadImage = require("../middleware/imagesUploader");
const {
  createSandCust,
  getAllSandCust,
  getSingleSandCust,
  updateSandCust,
  deleteSandCust,
} = require("../controllers/sandCustController");

const router = express.Router();

router.post(
  "/create",
  uploadImage.single("image"),
  verifyAdmin,
  createSandCust
);
router.get("/all", getAllSandCust);
router.get("/:id", getSingleSandCust);
router.put(
  "/update/:id",
  verifyAdmin,
  uploadImage.single("image"),
  updateSandCust
);
router.delete("/delete/:id", verifyAdmin, deleteSandCust);

module.exports = router;
