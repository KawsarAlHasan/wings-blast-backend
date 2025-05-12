const db = require("../config/db");

// update Global Status
exports.updateGlobalStatus = async (req, res) => {
  try {
    const { id, status, table } = req.body;

    if (!id || !status || !table) {
      return res.status(400).send({
        success: false,
        message: "Please provide id, status & table field",
      });
    }

    const [preData] = await db.query(`SELECT * FROM ${table} WHERE id=?`, [id]);

    if (!preData || preData.length == 0) {
      return res.status(201).send({
        success: false,
        message: `${table} not found`,
      });
    }

    // Execute the update query
    const [result] = await db.query(
      `UPDATE ${table} SET status = ? WHERE id = ?`,
      [status, id]
    );

    // Success response
    res.status(200).send({
      success: true,
      message: `${table} Status updated successfully`,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
