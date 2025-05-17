const db = require("../config/db");

// Global Data fetch controller
exports.getGlobalDataFetch = async (req, res) => {
  try {
    const { table } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    if (!table) {
      return res.status(400).send({
        success: false,
        message: "Please provide table field",
      });
    }

    const currentPage = parseInt(page);
    const perPage = parseInt(limit);
    const offset = (currentPage - 1) * perPage;

    let whereClause = "";
    const values = [];

    if (status) {
      whereClause = ` WHERE status = ?`;
      values.push(status);
    }

    // Query 1: Total Count
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM \`${table}\`${whereClause}`,
      values
    );
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / perPage);

    // Query 2: Paginated Data
    const dataQuery = `SELECT * FROM \`${table}\`${whereClause} LIMIT ? OFFSET ?`;
    const [data] = await db.query(dataQuery, [...values, perPage, offset]);

    res.status(200).send({
      success: true,
      message: `Fetched data from ${table}${
        status ? ` with status = ${status}` : ""
      }`,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        perPage,
      },
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
