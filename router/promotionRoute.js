const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");
const {
  createPromition,
  getAllPromotion,
  getSinglePromotion,
  updatePromotion,
  deletePromotion,
  sendPromotionUser,
  getPromotionSendUser,
} = require("../controllers/promotionController");

const router = express.Router();

router.post("/create", createPromition);
router.get("/all", getAllPromotion);
router.get("/couponsSendUser", getPromotionSendUser);
router.get("/:id", getSinglePromotion);
router.put("/update/:id", updatePromotion);
router.delete("/delete/:id", deletePromotion);
router.post("/", sendPromotionUser);

module.exports = router;
