const express = require("express");
const {
  addToCard,
  getMyCards,
  deleteSingleFoodFromCard,
  deleteAllFoodFromCard,
} = require("../controllers/cardController");

const router = express.Router();

router.post("/addtocard", addToCard);
router.get("/my-card", getMyCards);
router.delete("/all/:id", deleteAllFoodFromCard);
router.delete("/delete/:id", deleteSingleFoodFromCard);

module.exports = router;
