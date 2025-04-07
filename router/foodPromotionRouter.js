const express = require("express");
const { getFoodPromotion } = require("../controllers/foodPromotionController");

const router = express.Router();

router.get("/", getFoodPromotion);

module.exports = router;
