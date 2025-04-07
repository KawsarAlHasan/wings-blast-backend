const db = require("../config/db");

// get all Birthday vouchers
exports.getBirthdayVouchers = async (req, res) => {
  try {
    const { vouchers_name } = req.query;

    if (!vouchers_name) {
      return res.status(400).send({
        success: false,
        message: "Provide vouchers_name",
      });
    }

    const [data] = await db.query(
      "SELECT * FROM vouchers WHERE vouchers_name = ?",
      [vouchers_name]
    );

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Voucher not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get vaucher",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get vaucher",
      error: error.message,
    });
  }
};

// get singe Promotion
exports.getSinglePromotion = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM promotion WHERE id=? ", [id]);

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Promotion not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single Promotion",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single Promotion",
      error: error.message,
    });
  }
};

// update vouchers
exports.updateVouchers = async (req, res) => {
  try {
    const vouchers_name = req.params.vouchers_name;

    const {
      title,
      message,
      discount_percentage,
      discount_amount,
      is_discount_percentage,
    } = req.body;

    const images = req.file;
    let image = "";
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    const [preData] = await db.query(
      "SELECT * FROM vouchers WHERE vouchers_name = ?",
      [vouchers_name]
    );

    if (!preData || preData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Voucher not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE vouchers SET title=?, message=?, image=?, discount_percentage=?, discount_amount = ?, is_discount_percentage=? WHERE vouchers_name = ?",
      [
        title || preData[0].title,
        message || preData[0].message,
        image || preData[0].image,
        discount_percentage,
        discount_amount,
        is_discount_percentage,
        vouchers_name,
      ]
    );

    // Check if the Voucher was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Voucher not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Voucher updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Voucher",
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
