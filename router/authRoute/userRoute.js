const express = require("express");
const {
  signUpUser,
  userLogin,
  getMeUser,
  getAllUsers,
  userStatusUpdate,
  updateUser,
  getSingleUser,
  updateProfileUser,
  updateUserPassword,
  deleteUser,
  userSocialMediaLogin,
  verifyToken,
  sendOtpByTwilio,
  verifyTwilioOpt,
} = require("../../controllers/authController/userController");
const verifyUser = require("../../middleware/verifyUser");
const verifyAdmin = require("../../middleware/verifyAdmin");
const uploadImage = require("../../middleware/imagesUploader");

const router = express.Router();

router.post("/send-twilio-otp", sendOtpByTwilio);
router.post("/verify-twilio-otp", verifyTwilioOpt);
router.post("/firebase-login", verifyToken);
router.post("/signup", signUpUser);
router.post("/login", userLogin);
router.post("/social-login", userSocialMediaLogin);
router.get("/me", verifyUser, getMeUser);
router.get("/all", verifyAdmin, getAllUsers);
router.get("/:id", verifyAdmin, getSingleUser);
router.put("/update", verifyUser, updateUser);
router.put(
  "/update/profile",
  uploadImage.single("profile_pic"),
  verifyUser,
  updateProfileUser
);
router.put("/status/:id", verifyAdmin, userStatusUpdate);
router.put("/password", verifyUser, updateUserPassword);
router.delete("/delete/:id", deleteUser);

module.exports = router;
