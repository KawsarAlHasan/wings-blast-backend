const express = require("express");
const {
  signUpUser,
  userLogin,
  getMeUser,
  getAllUsers,
  userStatusUpdate,
  updateUser,
  getSingleUser,
} = require("../controllers/userController");
const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/login", userLogin);
router.get("/me", verifyUser, getMeUser);
router.get("/all", verifyAdmin, getAllUsers);
router.get("/:id", verifyAdmin, getSingleUser);
router.put("/update", verifyUser, updateUser);
router.put("/status/:id", verifyAdmin, userStatusUpdate);
// router.put("/password", verifyUser, updateUserPassword);
// router.delete("/delete/:id", verifyAdmin, deleteUser);

module.exports = router;
