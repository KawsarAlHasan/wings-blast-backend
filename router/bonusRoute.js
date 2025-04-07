const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");
const { createBonus, getAllBonus } = require("../controllers/bonusController");

const router = express.Router();

router.post("/create", createBonus);
router.get("/all", getAllBonus);
// router.get("/couponsSendUser", getPromotionSendUser);
// router.get("/:id", getSinglePromotion);
// router.put("/update/:id", updatePromotion);
// router.delete("/delete/:id", deletePromotion);
// router.post("/", sendPromotionUser);

module.exports = router;
