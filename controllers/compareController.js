const db = require("../config/db");

exports.getProductSaleCompare = async (req, res) => {
  try {
    const { startFromDate, startToDate, endFromDate, endToDate } = req.query;

    // Validate date inputs
    if (!startFromDate || !startToDate || !endFromDate || !endToDate) {
      return res.status(400).send({
        success: false,
        message: "All date ranges are required for comparison.",
      });
    }

    // Add time to the dates for accurate comparison
    const startFromDateTime = `${startFromDate} 00:00:00`;
    const startToDateTime = `${startToDate} 23:59:59`;
    const endFromDateTime = `${endFromDate} 00:00:00`;
    const endToDateTime = `${endToDate} 23:59:59`;

    // Query for the first period (startFromDate to startToDate)
    const [firstPeriodData] = await db.query(
      "SELECT * FROM orders WHERE created_at BETWEEN ? AND ?",
      [startFromDateTime, startToDateTime]
    );

    // Fetch foods data for the first period
    let foodsFirstPeriod = [];
    for (const singleFirstPeriod of firstPeriodData) {
      const [foods] = await db.query(
        "SELECT * FROM orders_foods WHERE order_id = ?",
        [singleFirstPeriod.id]
      );
      foodsFirstPeriod = foodsFirstPeriod.concat(foods);
    }

    // Query for the second period (endFromDate to endToDate)
    const [secondPeriodData] = await db.query(
      "SELECT * FROM orders WHERE created_at BETWEEN ? AND ?",
      [endFromDateTime, endToDateTime]
    );

    // Fetch foods data for the second period
    let foodsSecondPeriod = [];
    for (const singleSecondPeriod of secondPeriodData) {
      const [foods] = await db.query(
        "SELECT * FROM orders_foods WHERE order_id = ?",
        [singleSecondPeriod.id]
      );
      foodsSecondPeriod = foodsSecondPeriod.concat(foods);
    }

    // Calculate total quantity sold for each food item in the first period
    const firstPeriodSales = foodsFirstPeriod.reduce((acc, food) => {
      if (!acc[food.name]) {
        acc[food.name] = 0;
      }
      acc[food.name] += food.quantity;
      return acc;
    }, {});

    // Calculate total quantity sold for each food item in the second period
    const secondPeriodSales = foodsSecondPeriod.reduce((acc, food) => {
      if (!acc[food.name]) {
        acc[food.name] = 0;
      }
      acc[food.name] += food.quantity;
      return acc;
    }, {});

    res.status(200).send({
      success: true,
      message: "Sales comparison retrieved successfully.",
      //   firstPeriodData: firstPeriodData,
      //   secondPeriodData: secondPeriodData,
      foodsFirstPeriod: firstPeriodSales,
      foodsSecondPeriod: secondPeriodSales,
      foodsSecondPeriod,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
