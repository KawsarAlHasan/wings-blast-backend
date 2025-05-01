const express = require("express");

const verifyAdmin = require("../../middleware/verifyAdmin");

const {
  createBanner,
  getAllBanner,
  updateBanner,
  deleteBanner,
  statusUpdateBanner,
} = require("../../controllers/settings/bannerController");

const uploadFile = require("../../middleware/fileUpload");

const router = express.Router();

router.get("/", getAllBanner);
router.post("/create", verifyAdmin, uploadFile.single("file"), createBanner);
router.put("/update/:id", verifyAdmin, uploadFile.single("file"), updateBanner);
router.put("/status/:id", verifyAdmin, statusUpdateBanner);
router.delete("/delete/:id", verifyAdmin, deleteBanner);

module.exports = router;
