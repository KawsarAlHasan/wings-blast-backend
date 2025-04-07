const schedule = require("node-schedule");
const db = require("./config/db");

const foodDetailsStatus = async () => {
  try {
    const now = new Date();
    const formattedNow = now.toISOString().slice(0, 19).replace("T", " ");

    // Query with conditions
    const [data] = await db.query(
      `SELECT * FROM food_details WHERE status = 'deactivate' AND status_deactivate_date <= ?`,
      [formattedNow]
    );

    if (!data || data.length === 0) {
      return;
    }

    for (const foodDetails of data) {
      const foodDetailsId = foodDetails.id;

      // Update the status to active and reset status_deactivate_date
      await db.query(
        `UPDATE food_details SET status = 'active', status_deactivate_date = NULL WHERE id = ?`,
        [foodDetailsId]
      );
    }
  } catch (error) {
    console.error("Error Food Details Status change:", error.message);
  }
};

schedule.scheduleJob("0 * * * *", foodDetailsStatus);

module.exports = foodDetailsStatus;
