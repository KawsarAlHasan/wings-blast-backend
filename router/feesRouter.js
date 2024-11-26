const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");
const {
  createFees,
  getAllFees,
  updateFees,
  deleteFees,
} = require("../controllers/feesController");

const router = express.Router();

router.post("/create", createFees);
router.get("/", getAllFees);
router.put("/update/:id", updateFees);
router.delete("/delete/:id", deleteFees);

module.exports = router;
