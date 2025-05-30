const db = require("../config/db");
const { sendBulkPromotionEmails } = require("../middleware/sendBulkEmails");

// create Promotion
exports.createPromition = async (req, res) => {
  try {
    const {
      name,
      code,
      date,
      discount_percentage,
      discount_amount,
      start_date,
      end_date,
      is_date,
      is_duration_date,
      is_discount_percentage,
      is_discount_amount,
    } = req.body;

    if (!name || !code) {
      return res.status(400).send({
        success: false,
        message: "Please provide name & code field",
      });
    }

    // Insert Promotion into the database
    const [result] = await db.query(
      "INSERT INTO promotion ( name, code, date, discount_percentage, discount_amount, start_date, end_date, is_date, is_duration_date, is_discount_percentage, is_discount_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name || "",
        code || "",
        date || "",
        discount_percentage || "",
        discount_amount || 0,
        start_date || 0,
        end_date || "",
        is_date || 0,
        is_duration_date || 0,
        is_discount_percentage || 0,
        is_discount_amount || 0,
      ]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Promotion, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Promotion inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Promotion",
      error: error.message,
    });
  }
};

// get food Promotion
exports.getFoodPromotion = async (req, res) => {
  try {
    const [data] = await db.query(
      "SELECT food_id, code, date, discount_percentage, discount_amount, start_date, end_date, is_date, is_duration_date, is_discount_percentage, is_discount_amount FROM promotion WHERE id=?",
      [1]
    );

    // Retrieve food details from the main table
    const [foodDetails] = await db.query(
      "SELECT * FROM food_details WHERE id =?",
      [data[0].food_id]
    );

    const result = {
      ...data[0],
      foodDetails: foodDetails[0],
    };

    res.status(200).send({
      success: true,
      message: "Get Food Promotion",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Food Promotion",
      error: error.message,
    });
  }
};

// update Promotion
exports.updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      code,
      date,
      discount_percentage,
      discount_amount,
      start_date,
      end_date,
      is_date,
      is_duration_date,
      is_discount_percentage,
      is_discount_amount,
    } = req.body;

    const [preData] = await db.query(`SELECT * FROM promotion WHERE id=?`, [
      id,
    ]);

    if (!preData || preData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Promotion not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE promotion SET name=?, code=?, date=?, discount_percentage = ?, discount_amount = ?, start_date=?, end_date=?, is_date=?, is_duration_date=?, is_discount_percentage=?, is_discount_amount=? WHERE id = ?",
      [
        name || preData[0].name,
        code || preData[0].code,
        date,
        discount_percentage,
        discount_amount,
        start_date,
        end_date,
        is_date,
        is_duration_date,
        is_discount_percentage,
        is_discount_amount,
        id,
      ]
    );

    // Check if the Promotion was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Promotion not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Promotion updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Promotion",
      error: error.message,
    });
  }
};

// delete Promotion
exports.deletePromotion = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the Promotion exists in the database
    const [data] = await db.query(`SELECT * FROM promotion WHERE id = ?`, [id]);

    // If Promotion not found, return 404
    if (!data || data.length === 0) {
      return res.status(201).send({
        success: false,
        message: "Promotion not found",
      });
    }

    // Proceed to delete the Promotion
    const [result] = await db.query(`DELETE FROM promotion WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete Promotion",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Promotion deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting Promotion",
      error: error.message,
    });
  }
};

exports.sendPromotionUser = async (req, res) => {
  try {
    const {
      user_ids,
      promotion_id,
      promotion_name,
      promotion_discount_percentage,
      promotion_code,
      promotion_discount_price,
      promotion_expiration_date,
      promotion_image,
      promotion_is_discount_percentage,
    } = req.body;

    const currentTime = new Date();

    const [existingUsers] = await db.query(
      `SELECT user_id, sent_time FROM user_promotion WHERE promotion_id = ? AND user_id IN (?)`,
      [promotion_id, user_ids]
    );

    const [users] = await db.query(
      `SELECT first_name, last_name, email FROM users WHERE id IN (?)`,
      [user_ids]
    );

    const existingUserIds = existingUsers.map((user) => user.user_id);
    const newUserIds = user_ids.filter((id) => !existingUserIds.includes(id));

    if (existingUsers.length > 0) {
      await Promise.all(
        existingUsers.map((user) =>
          db.query(
            `UPDATE user_promotion SET sent_time = ?, sent_at = ? WHERE user_id = ? AND promotion_id = ?`,
            [user.sent_time + 1, currentTime, user.user_id, promotion_id]
          )
        )
      );
    }

    if (newUserIds.length > 0) {
      const values = newUserIds.map((id) => [id, promotion_id, 1, currentTime]);
      await db.query(
        `INSERT INTO user_promotion (user_id, promotion_id, sent_time, sent_at) VALUES ?`,
        [values]
      );
    }

    const promotion = {
      id: promotion_id,
      name: promotion_name,
      discount_percentage: promotion_discount_percentage,
      code: promotion_code,
      discount_price: promotion_discount_price,
      expiration_date: promotion_expiration_date,
      image: promotion_image,
      is_discount_percentage: promotion_is_discount_percentage,
    };

    const emailSent = await sendBulkPromotionEmails(users, promotion);

    if (!emailSent) {
      return res.status(500).json({
        message: "Error sending emails",
      });
    }

    res.status(200).json({
      message: "promotions sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending promotions",
      error: error.message,
    });
  }
};

exports.getPromotionSendUser = async (req, res) => {
  try {
    const { user_id, promotion_id, used_time } = req.query;

    let query = `
    SELECT 
      up.*, 
      u.first_name AS first_name, 
      u.last_name AS last_name, 
      u.email AS email
    FROM user_promotion up
    LEFT JOIN users u ON up.user_id = u.id
  `;

    let conditions = [];
    let queryParams = [];

    if (user_id) {
      conditions.push("user_id = ?");
      queryParams.push(user_id);
    }

    if (promotion_id) {
      conditions.push("promotion_id = ?");
      queryParams.push(promotion_id);
    }

    if (used_time) {
      conditions.push("used_time = ?");
      queryParams.push(used_time);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    // Execute the query
    const [data] = await db.query(query, queryParams);

    res.status(200).send({
      success: true,
      message: "Get Promotion Send Users",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internel Server Error",
      error: error.message,
    });
  }
};
