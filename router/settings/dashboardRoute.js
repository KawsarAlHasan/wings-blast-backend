const express = require("express");

const verifyAdmin = require("../../middleware/verifyAdmin");
const {
  getDashboard,
  getOrderInformation,
  getFoodOrderInformation,
  getYearlyOrders,
} = require("../../controllers/settings/dashboardController");

const router = express.Router();

router.get("/", getDashboard);
router.get("/orders", getOrderInformation);
router.get("/orders-food", getFoodOrderInformation);
router.get("/orders-yearly", getYearlyOrders);

module.exports = router;
