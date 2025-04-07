const express = require("express");
const {
  fetchUnreadNotifications,
  markNotificationAsRead,
  deleteNotification,
  fetchUnreadNotificationsForAdmin,
} = require("../controllers/notificationsController");

const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

router.get("/", verifyAdmin, fetchUnreadNotificationsForAdmin);
router.get("/all", verifyUser, fetchUnreadNotifications);
router.put("/update/:id", markNotificationAsRead);
router.delete("/delete/:id", deleteNotification);

module.exports = router;
