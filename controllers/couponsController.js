const db = require("../config/db");

// create coupons
exports.createCoupons = async (req, res) => {
  try {
    const { code, discount_price, expiration_date, is_active } = req.body;
    if (!code || !discount_price) {
      return res.status(400).send({
        success: false,
        message: "Please provide code, discount_price field",
      });
    }

    const [checkData] = await db.query("SELECT * FROM coupons WHERE code=?", [
      code,
    ]);

    if (checkData.length > 0) {
      return res.status(400).send({
        success: false,
        message: "This Code already used",
      });
    }

    // Insert coupons into the database
    const [result] = await db.query(
      "INSERT INTO coupons (code, discount_price, expiration_date, is_active) VALUES (?, ?, ?, ?)",
      [code, discount_price, expiration_date || "2025-10-28", is_active || 1]
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

    res.status(200).send({
      success: true,
      message: "Get Single coupons",
      data: data[0],
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

    const { code, discount_price, expiration_date, is_active } = req.body;

    const [checkData] = await db.query(
      "SELECT * FROM coupons WHERE code=? AND id !=?",
      [code, id]
    );

    if (checkData.length > 0) {
      return res.status(400).send({
        success: false,
        message: "This Code already used",
      });
    }

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
      "UPDATE coupons SET code = ?, discount_price= ?, expiration_date=?, is_active=? WHERE id = ?",
      [
        code || existingCoupons[0].code,
        discount_price || existingCoupons[0].discount_price,
        expiration_date || existingCoupons[0].expiration_date,
        is_active || existingCoupons[0].is_active,
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
