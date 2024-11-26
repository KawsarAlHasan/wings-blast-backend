const db = require("../config/db");

exports.createTips = async (req, res) => {
  try {
    const { amount_rate } = req.body;

    if (!amount_rate) {
      return res.status(400).send({
        success: false,
        message: "amount_rate is required in body",
      });
    }

    const [data] = await db.query("INSERT tips SET amount_rate=?", [
      amount_rate,
    ]);

    res.status(200).send({
      success: true,
      message: "Tips Insert successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getAllTips = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM tips");

    res.status(200).send({
      success: true,
      message: "Tips Get successfully",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
