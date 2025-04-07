const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");
const {
  getAllOpeningClosing,
  updateOpeningClosing,
  getSingleOpeningClosing,
  updateDayOnOrOff,
  checkASAPOpen,
} = require("../controllers/openingAndClosing");

const router = express.Router();

router.get("/check", checkASAPOpen);
router.get("/", getAllOpeningClosing);
router.get("/:id", getSingleOpeningClosing);
router.put("/update/:id", updateOpeningClosing);
router.put("/day/:id", updateDayOnOrOff);

module.exports = router;
