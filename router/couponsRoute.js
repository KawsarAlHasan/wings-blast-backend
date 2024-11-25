const express = require("express");
const {
  createCoupons,
  getAllCoupons,
  getSingleCoupons,
  updateCoupons,
  checkCoupon,
  deleteCoupons,
} = require("../controllers/couponsController");

const router = express.Router();

router.post("/create", createCoupons);
router.get("/", getAllCoupons);
router.get("/:id", getSingleCoupons);
router.put("/update/:id", updateCoupons);
router.put("/check", checkCoupon);
router.delete("/delete/:id", deleteCoupons);

module.exports = router;
