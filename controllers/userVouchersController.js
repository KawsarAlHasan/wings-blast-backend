const db = require("../config/db");

exports.getAllUserVoucher = async (req, res) => {
  try {
    const { is_used } = req.query;

    let query = `SELECT 
            uv.*,
            u.first_name,
            u.last_name,
            u.email
           FROM user_vouchers uv
           JOIN users u ON uv.user_id = u.id
           WHERE 1=1`;

    const queryParams = [];

    if (is_used) {
      query += " AND is_used = ?";
      queryParams.push(is_used);
    }

    const [data] = await db.query(query, queryParams);

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "User Voucher not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get all user voucher",
      totalData: data.length,
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
