const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");
const {
  createFeature,
  getAllFeature,
  getSingleFeature,
  updateFeature,
  deleteFeature,
} = require("../controllers/featureController");

const router = express.Router();

router.post("/create", verifyAdmin, createFeature);
router.get("/all/:id", getAllFeature);
router.get("/:id", getSingleFeature);
router.put("/update/:id", verifyAdmin, updateFeature);
router.delete("/delete/:id", verifyAdmin, deleteFeature);

module.exports = router;
