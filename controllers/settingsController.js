const db = require("../config/db");

// get Delivery Fee
exports.getDeliveryFee = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM delivery_fee");

    res.status(200).send({
      success: true,
      message: "Get Delivery Fee",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Delivery Fee",
      error: error.message,
    });
  }
};

// update Delivery Fee
exports.updateDeliveryFee = async (req, res) => {
  try {
    const { id } = req.params;

    const { region, fee } = req.body;

    const [deliveryFeePreData] = await db.query(
      `SELECT * FROM delivery_fee WHERE id=?`,
      [id]
    );

    // Execute the update query
    const [result] = await db.query(
      "UPDATE delivery_fee SET region = ?, fee=? WHERE id = ?",
      [
        region || deliveryFeePreData[0].region,
        fee || deliveryFeePreData[0].fee,
        id,
      ]
    );

    // Check if the Delivery Fee was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Delivery Fee not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Delivery Fee updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Delivery Fee",
      error: error.message,
    });
  }
};

// get Tax
exports.getTax = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM tax");

    res.status(200).send({
      success: true,
      message: "Get Tax",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Tax",
      error: error.message,
    });
  }
};

// update Tax
exports.updateTax = async (req, res) => {
  try {
    const { id } = req.params;

    const { tax_name, tax_rate, region } = req.body;

    const [preData] = await db.query(`SELECT * FROM tax WHERE id=?`, [id]);

    // Execute the update query
    const [result] = await db.query(
      "UPDATE tax SET tax_name = ?, tax_rate=?, region=? WHERE id = ?",
      [
        tax_name || preData[0].tax_name,
        tax_rate || preData[0].tax_rate,
        region || preData[0].region,
        id,
      ]
    );

    // Check if the Tax was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Tax not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Tax updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Tax",
      error: error.message,
    });
  }
};

// get footer_settings
exports.getFooterSettings = async (req, res) => {
  try {
    const type = req.params.type;

    const [data] = await db.query(
      "SELECT * FROM footer_settings WHERE type =?",
      [type]
    );

    res.status(200).send({
      success: true,
      message: `Get ${type}`,
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// update footer_settings
exports.updateFooterSettings = async (req, res) => {
  try {
    const type = req.params.type;

    const { content } = req.body;

    const [preData] = await db.query(
      `SELECT * FROM footer_settings WHERE type=?`,
      [type]
    );

    // Execute the update query
    const [result] = await db.query(
      "UPDATE footer_settings SET content=? WHERE type = ?",
      [content || preData[0].content, type]
    );

    // Check if the footer_settings was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: `${type} not found or no changes made`,
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: `${type} updated successfully`,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
