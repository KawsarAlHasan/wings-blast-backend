const express = require("express");
const {
  createOrders,
  getAllOrders,
  getSingleOrder,
  getUserOrders,
  orderStatus,
  createOrder,
} = require("../controllers/ordersController");

const router = express.Router();

router.post("/create", createOrders);
router.post("/check", createOrder);
router.get("/all", getAllOrders);
router.get("/user-id/:user_id", getUserOrders);
router.get("/:id", getSingleOrder);
router.put("/status/:id", orderStatus);

module.exports = router;
