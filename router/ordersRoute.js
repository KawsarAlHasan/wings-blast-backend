const express = require("express");
const {
  createOrders,
  getAllOrders,
  getSingleOrder,
  getUserOrders,
} = require("../controllers/ordersController");

const router = express.Router();

router.post("/create", createOrders);
router.get("/all", getAllOrders);
router.get("/user-id/:user_id", getUserOrders);
router.get("/:id", getSingleOrder);

module.exports = router;
