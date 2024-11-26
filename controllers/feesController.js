const db = require("../config/db");

// create fees
exports.createFees = async (req, res) => {
  try {
    const { fee_name, fee_amount, fee_description } = req.body;

    // Insert fees into the database
    const [result] = await db.query(
      "INSERT INTO fees (fee_name, fee_amount, fee_description) VALUES (?, ?, ?)",
      [fee_name || "", fee_amount || 0, fee_description || ""]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert fees, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "fees inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the fees",
      error: error.message,
    });
  }
};

// get all fees
exports.getAllFees = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM fees");

    res.status(200).send({
      success: true,
      message: "Get all fees",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All fees",
      error: error.message,
    });
  }
};

// update fees
exports.updateFees = async (req, res) => {
  try {
    const { id } = req.params;

    const { fee_name, fee_amount, fee_description } = req.body;

    const [preData] = await db.query(`SELECT * FROM fees WHERE id=?`, [id]);

    if (!preData || preData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "fees not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE fees SET fee_name=?, fee_amount=?, fee_description = ? WHERE id = ?",
      [
        fee_name || preData[0].fee_name,
        fee_amount || preData[0].fee_amount,
        fee_description || preData[0].fee_description,
        id,
      ]
    );

    // Check if the Fees was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Fees not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Fees updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Fees",
      error: error.message,
    });
  }
};

// delete fees
exports.deleteFees = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the fees exists in the database
    const [fees] = await db.query(`SELECT * FROM fees WHERE id = ?`, [id]);

    // If fees not found, return 404
    if (!fees || fees.length === 0) {
      return res.status(201).send({
        success: false,
        message: "fees not found",
      });
    }

    // Proceed to delete the fees
    const [result] = await db.query(`DELETE FROM fees WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete fees",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "fees deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting fees",
      error: error.message,
    });
  }
};
