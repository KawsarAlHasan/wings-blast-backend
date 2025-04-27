const db = require("../config/db");
const { sendBulkEmails } = require("../middleware/sendBulkEmails");
const { sendBulkPromotionEmails } = require("../middleware/sendBulkEmails");

// `coupons`(`id`, `name`, `carry_out_use_time`, `delivery_use_time`, `discount_percentage`, `discount_amount`, `date`, `start_date`, `end_date`, `is_date`, `is_duration_date`, `is_discount_percentage`, `is_discount_amount`, `is_active`

// create coupons
exports.createCoupons = async (req, res) => {
  try {
    const {
      name,
      carry_out_use_time,
      delivery_use_time,
      discount_percentage,
      discount_amount,
      date,
      start_date,
      end_date,
      is_date,
      is_duration_date,
      is_discount_percentage,
      is_discount_amount,
    } = req.body;

    const [result] = await db.query(
      "INSERT INTO coupons ( name, carry_out_use_time, delivery_use_time, discount_percentage, discount_amount, date, start_date, end_date, is_date, is_duration_date, is_discount_percentage, is_discount_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        carry_out_use_time || 0,
        delivery_use_time || 0,
        discount_percentage || 0,
        discount_amount || 0,
        date || 0,
        start_date || 0,
        end_date || 0,
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
        message: "Failed to insert coupons, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "coupons inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the coupons",
      error: error.message,
    });
  }
};

// get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM coupons");

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Promotion not found",
      });
    }

    for (const singleData of data) {
      const couponID = singleData.id;
      const [used_time] = await db.query(
        "SELECT SUM(used_time) AS total_used_time FROM user_coupons WHERE coupon_id =?",
        [couponID]
      );

      singleData.used_time = used_time[0].total_used_time;
    }

    res.status(200).send({
      success: true,
      message: "Get All coupons",
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All coupons",
      error: error.message,
    });
  }
};

// get single coupons
exports.getSingleCoupons = async (req, res) => {
  try {
    const id = req.params.id;

    const [data] = await db.query("SELECT * FROM coupons WHERE id =?", [id]);

    if (!data || data.length == 0) {
      return res.status(400).send({
        success: true,
        message: "No coupons found",
      });
    }

    const [used_time] = await db.query(
      "SELECT SUM(used_time) AS total_used_time FROM user_coupons WHERE coupon_id =?",
      [id]
    );

    res.status(200).send({
      success: true,
      message: "Get Single coupons",
      data: {
        ...data[0],
        used_time: used_time[0].total_used_time,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get single coupons",
      error: error.message,
    });
  }
};

// update coupons
exports.updateCoupons = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      name,
      carry_out_use_time,
      delivery_use_time,
      discount_percentage,
      discount_amount,
      date,
      start_date,
      end_date,
      is_date,
      is_duration_date,
      is_discount_percentage,
      is_discount_amount,
      is_active,
    } = req.body;

    // Check if coupons exists
    const [existingCoupons] = await db.query(
      "SELECT * FROM coupons WHERE id = ?",
      [id]
    );

    if (!existingCoupons || existingCoupons.length === 0) {
      return res.status(404).send({
        success: false,
        message: "coupons not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE coupons SET name=?, carry_out_use_time=?, delivery_use_time=?, discount_percentage=?, discount_amount=?, date=?, start_date=?, end_date=?, is_date=?, is_duration_date=?, is_discount_percentage=?, is_discount_amount=? WHERE id = ?",
      [
        name || existingCoupons[0].name,
        carry_out_use_time || existingCoupons[0].carry_out_use_time,
        delivery_use_time || existingCoupons[0].delivery_use_time,
        discount_percentage || existingCoupons[0].discount_percentage,
        discount_amount || existingCoupons[0].discount_amount,
        date || existingCoupons[0].date,
        start_date || existingCoupons[0].start_date,
        end_date || existingCoupons[0].end_date,
        is_date || existingCoupons[0].is_date,
        is_duration_date || existingCoupons[0].is_duration_date,
        is_discount_percentage || existingCoupons[0].is_discount_percentage,
        is_discount_amount || existingCoupons[0].is_discount_amount,
        id,
      ]
    );

    // Check if the coupons was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "coupons not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "coupons updated successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).send({
      success: false,
      message: "Error updating coupons",
      error: error.message,
    });
  }
};

// delete coupons
exports.deleteCoupons = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the coupons exists in the database
    const [coupons] = await db.query(`SELECT * FROM coupons WHERE id = ?`, [
      id,
    ]);

    // If coupons not found, return 404
    if (coupons.length === 0) {
      return res.status(404).send({
        success: false,
        message: "coupons not found",
      });
    }

    const [result] = await db.query(`DELETE FROM coupons WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete coupons",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "coupons deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting coupons",
      error: error.message,
    });
  }
};

// Check Coupon
exports.checkCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).send({
        success: false,
        message: "Please provide code field",
      });
    }

    // Fetch the coupon from the database
    const [data] = await db.query("SELECT * FROM coupons WHERE code = ?", [
      code,
    ]);

    // Check if the coupon exists
    if (!data || data.length == 0) {
      return res.status(400).send({
        success: true,
        message: "No coupons found",
      });
    }

    const coupon = data[0];

    // Check if the coupon is expired
    const today = new Date();
    const expirationDate = new Date(coupon.expiration_date);

    if (expirationDate < today || !coupon.is_active) {
      return res.status(400).send({
        success: true,
        message: "No coupons found",
      });
    }

    // If all checks pass, return the coupon data
    res.status(200).send({
      success: true,
      message: "Check coupons",
      data: coupon,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Check coupons",
      error: error.message,
    });
  }
};

exports.sendCouponUser = async (req, res) => {
  try {
    const {
      user_ids,
      coupon_id,
      coupon_name,
      coupon_discount_percentage,
      coupon_code,
      coupon_discount_price,
      coupon_expiration_date,
      coupon_image,
      coupon_is_discount_percentage,
    } = req.body;

    const currentTime = new Date();

    const [existingUsers] = await db.query(
      `SELECT user_id, sent_time FROM user_coupons WHERE coupon_id = ? AND user_id IN (?)`,
      [coupon_id, user_ids]
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
            `UPDATE user_coupons SET sent_time = ?, sent_at = ? WHERE user_id = ? AND coupon_id = ?`,
            [user.sent_time + 1, currentTime, user.user_id, coupon_id]
          )
        )
      );
    }

    if (newUserIds.length > 0) {
      const values = newUserIds.map((id) => [id, coupon_id, 1, currentTime]);
      await db.query(
        `INSERT INTO user_coupons (user_id, coupon_id, sent_time, sent_at) VALUES ?`,
        [values]
      );
    }

    const coupon = {
      id: coupon_id,
      name: coupon_name,
      discount_percentage: coupon_discount_percentage,
      code: coupon_code,
      discount_price: coupon_discount_price,
      expiration_date: coupon_expiration_date,
      image: coupon_image,
      is_discount_percentage: coupon_is_discount_percentage,
    };

    const emailSent = await sendBulkEmails(users, coupon);

    if (!emailSent) {
      return res.status(500).json({
        message: "Error sending emails",
      });
    }

    res.status(200).json({
      message: "Coupons sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending coupons",
      error: error.message,
    });
  }
};

exports.getCouponsSendUser = async (req, res) => {
  try {
    const { user_id, coupon_id, used_time } = req.query;

    let query = `
    SELECT 
      uc.*, 
      u.first_name AS first_name, 
      u.last_name AS last_name, 
      u.email AS email
    FROM user_coupons uc
    LEFT JOIN users u ON uc.user_id = u.id
  `;

    let conditions = [];
    let queryParams = [];

    if (user_id) {
      conditions.push("user_id = ?");
      queryParams.push(user_id);
    }

    if (coupon_id) {
      conditions.push("coupon_id = ?");
      queryParams.push(coupon_id);
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
      message: "Get Coupon Send Users",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internel Server Error",
      error: error.message,
    });
  }
};

// `coupons`(`id`, `name`, `carry_out_use_time`, `delivery_use_time`, `discount_percentage`, `discount_amount`, `date`, `start_date`, `end_date`, `is_date`, `is_duration_date`, `is_discount_percentage`, `is_discount_amount`, `is_active`)

// `user_coupons`(`id`, `user_id`, `coupon_id`, `sent_time`, `used_time`, `carry_out_used_time`, `sent_at`, `used_at`)

exports.getMyDiscountsOffer = async (req, res) => {
  try {
    const [data] = await db.query(`SELECT * FROM user_coupons`);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getMyDiscountsOffer = async (req, res) => {
  const userId = req.params.userId; // ধরলাম userId URL থেকে আসতেছে
  const currentDate = new Date(); // আজকের তারিখ
  try {
    const [rows] = await db.query(
      `
      SELECT uc.*, c.*
      FROM user_coupons uc
      INNER JOIN coupons c ON uc.coupon_id = c.id
      WHERE uc.user_id = ?
        AND c.is_active = 1
        AND (
          (c.is_date = 1 AND ? BETWEEN c.start_date AND c.end_date)
          OR c.is_date = 0
        )
      `,
      [userId, currentDate]
    );

    // এখন ডাটার ভেতরে যেয়ে চেক করবো কোনটা carry_out, কোনটা delivery available
    const coupons = rows.map((row) => {
      return {
        id: row.coupon_id,
        name: row.name,
        discount_percentage: row.discount_percentage,
        discount_amount: row.discount_amount,
        carry_out_available: row.carry_out_use_time > row.carry_out_used_time,
        delivery_available: row.delivery_use_time > row.used_time,
        start_date: row.start_date,
        end_date: row.end_date,
        is_date_based: row.is_date,
        is_active: row.is_active,
      };
    });

    res.status(200).send({
      success: true,
      data: coupons,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getMyDiscountsOffer = async (req, res) => {
  const userId = req.params.userId; // ধরলাম তুমি URL থেকে userId পাঠাচ্ছো
  const currentDate = new Date(); // আজকের তারিখ
  try {
    const [data] = await db.query(
      `
      SELECT uc.*, c.*
      FROM user_coupons uc
      INNER JOIN coupons c ON uc.coupon_id = c.id
      WHERE uc.user_id = ?
        AND c.is_active = 1
        AND (
          (c.is_date = 1 AND ? BETWEEN c.start_date AND c.end_date)
          OR c.is_date = 0
        )
        AND (
          (c.carry_out_use_time > uc.carry_out_used_time)
          OR (c.delivery_use_time > uc.used_time)
        )
      `,
      [userId, currentDate]
    );

    res.status(200).send({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
