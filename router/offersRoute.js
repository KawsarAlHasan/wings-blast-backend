const express = require("express");
const {
  createOffers,
  getMyDiscountsOffers,
  getAllOffers,
  getSingleOffer,
  sendOfferUser,
  getAllUsers,
  getOffersSendUser,
  updateOffers,
  deleteOffers,
} = require("../controllers/offersController");

const router = express.Router();

router.post("/create", createOffers);
router.post("/check-offer", getMyDiscountsOffers);
router.get("/all", getAllOffers);
router.get("/single/:id", getSingleOffer);
router.post("/", sendOfferUser);
router.get("/all-users", getAllUsers);
router.get("/offer-send-user", getOffersSendUser);
router.put("/update/:id", updateOffers);
router.delete("/delete/:id", deleteOffers);

module.exports = router;
