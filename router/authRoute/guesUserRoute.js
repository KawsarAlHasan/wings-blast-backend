const express = require("express");
const {
  createGuestUser,
  getGuestUser,
} = require("../../controllers/authController/guestUserController");
const verifyGuestUser = require("../../middleware/verifyGuestUser");

const router = express.Router();

router.post("/create", createGuestUser);
router.get("/", verifyGuestUser, getGuestUser);

module.exports = router;
