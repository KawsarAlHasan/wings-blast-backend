const express = require("express");
const {
  addCard,
  deleteSingleFoodFromCard,
  deleteAllFoodFromCard,
  getMyCard,
} = require("../controllers/cardController");

const router = express.Router();

router.post("/add", addCard);
router.get("/", getMyCard);
router.delete("/all/:id", deleteAllFoodFromCard);
router.delete("/delete/:id", deleteSingleFoodFromCard);

module.exports = router;
