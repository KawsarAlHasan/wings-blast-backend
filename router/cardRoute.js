const express = require("express");
const {
  addCard,
  deleteSingleFoodFromCart,
  deleteAllFoodFromCart,
  getMyCard,
} = require("../controllers/cardController");

const router = express.Router();

router.post("/add", addCard);
router.get("/", getMyCard);
router.delete("/all", deleteAllFoodFromCart);
router.delete("/delete/:id", deleteSingleFoodFromCart);

module.exports = router;
