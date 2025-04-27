const express = require("express");
const {
  createCoupons,
  getAllCoupons,
  getSingleCoupons,
  updateCoupons,
  checkCoupon,
  deleteCoupons,
  sendCouponUser,
  getCouponsSendUser,
  getMyDiscountsOffers,
} = require("../controllers/couponsController");

const router = express.Router();

router.post("/create", createCoupons);
router.get("/", getAllCoupons);
router.get("/couponsSendUser", getCouponsSendUser);
router.get("/:id", getSingleCoupons);
router.put("/update/:id", updateCoupons);
router.put("/check", checkCoupon);
router.post("/check-offer", getMyDiscountsOffers);
router.delete("/delete/:id", deleteCoupons);
router.post("/", sendCouponUser);

module.exports = router;
