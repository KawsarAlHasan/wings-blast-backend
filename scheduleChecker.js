const schedule = require("node-schedule");
const db = require("./config/db");
const firebaseAdmin = require("./config/firebase");

const notifyAdminBeforeOrder = async () => {
  try {
    const now = new Date();

    const currentDate = now.toISOString().split("T")[0];
    const targetTime = new Date(now.getTime() + 30 * 60 * 1000);
    const startTime = targetTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const endTime = new Date(
      targetTime.getTime() + 60 * 60 * 1000
    ).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const targetTimeString = `${startTime} - ${endTime}`;

    const [orders] = await db.query(
      `
          SELECT
              *
          FROM
              orders
          WHERE
              isLater = 1
              AND DATE(later_date) = ?
              AND later_slot =?
        `,
      [currentDate, targetTimeString]
    );

    if (!orders || orders.length === 0) {
      return;
    }

    for (const order of orders) {
      const { id, order_id, first_name, last_name, user_id } = order;

      // Notify Admin
      const title = "Upcoming Order Alert";
      const message = `Upcoming Order Alert: Order ID ${order_id}, Scheduled by ${first_name} ${last_name}, Scheduled for ${order.later_date} (${order.later_slot}).`;

      const [adminDeviceData] = await db.query(
        "SELECT * FROM admin_device WHERE admin_id=?",
        [1]
      );
      for (const token of adminDeviceData) {
        const registrationToken = token?.fcm_device_token;
        const messageFMS = {
          notification: {
            title: title,
            body: message,
          },
          token: registrationToken,
          data: {
            order: JSON.stringify(order),
          },
        };
        const response = await firebaseAdmin.messaging().send(messageFMS);
        console.log("Successfully sent message:", response);
      }

      await db.query(
        "INSERT INTO notifications (type, receiver_id, sander_id, url, title, message) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "Admin",
          1, // Admin ID
          user_id,
          `/order/${id}`,
          "Upcoming Order Alert",
          message,
        ]
      );
    }
  } catch (error) {
    console.error("Error notifying admin:", error.message);
  }
};

// Run the job every 1 minute
schedule.scheduleJob("*/1 * * * *", notifyAdminBeforeOrder);

module.exports = notifyAdminBeforeOrder;
