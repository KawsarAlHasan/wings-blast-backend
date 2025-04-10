const express = require("express");
const {
  addCard,
  deleteSingleFoodFromCard,
  deleteAllFoodFromCard,
  getMyCard,
  addToCard,
  getMyCards,
} = require("../controllers/cardController");

const router = express.Router();

router.post("/add", addCard);
router.post("/addtocard", addToCard);
router.get("/", getMyCard);
router.get("/my-card", getMyCards);
router.delete("/all/:id", deleteAllFoodFromCard);
router.delete("/delete/:id", deleteSingleFoodFromCard);

module.exports = router;
