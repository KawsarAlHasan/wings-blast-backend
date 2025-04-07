const db = require("./config/db");
const firebaseAdmin = require("./config/firebase");

exports.test = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    const [orders] = await db.query(`SELECT * FROM orders WHERE id=?`, [1071]);

    for (const order of orders) {
      const { id, order_id, first_name, last_name, user_id } = order;

      // Notify Admin
      const title = "Upcoming Order Alert";
      const message = `Upcoming Order Alert: Order ID ${order_id}, Scheduled by ${first_name} ${last_name}, Scheduled for ${order.later_date} (${order.later_slot}).`;

      const messageFMS = {
        notification: {
          title: title,
          body: message,
        },
        token: fcmToken,
        data: {
          order: JSON.stringify(order),
        },
      };
      const response = await firebaseAdmin.messaging().send(messageFMS);
      console.log("Successfully sent message:", response);

      res.status(200).send({
        success: true,
        message: "Successfully sent message",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error sent message",
      error: error.message,
    });
  }
};
