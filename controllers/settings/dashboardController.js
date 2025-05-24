const db = require("../../config/db");

// get dashboard
exports.getDashboard = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const startDate = start_date ? new Date(start_date) : null;
    const endDate = end_date ? new Date(end_date) : null;

    const [userCount] = await db.query("SELECT COUNT(id) FROM users");
    const [activeUserCount] = await db.query(
      "SELECT COUNT(id) FROM users WHERE status = 'Active'"
    );

    // Query for new users
    let newUserQuery = "";
    let newUserParams = [];

    if (startDate && endDate) {
      newUserQuery = `
        SELECT COUNT(id) FROM users 
        WHERE status = 'Active' 
        AND create_at BETWEEN ? AND ?
      `;
      newUserParams = [startDate, endDate];
    } else {
      newUserQuery = `
        SELECT COUNT(id) FROM users 
        WHERE status = 'Active' 
        AND MONTH(create_at) = MONTH(CURRENT_DATE()) 
        AND YEAR(create_at) = YEAR(CURRENT_DATE())
      `;
    }

    const [newUser] = await db.query(newUserQuery, newUserParams);

    // Query for total sales
    let salesQuery = "";
    let salesParams = [];

    if (startDate && endDate) {
      salesQuery = `
        SELECT SUM(total_price) AS total FROM orders 
        WHERE created_at BETWEEN ? AND ?
      `;
      salesParams = [startDate, endDate];
    } else {
      salesQuery = `
        SELECT SUM(total_price) AS total FROM orders 
        WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
      `;
    }

    const [totalSalesResult] = await db.query(salesQuery, salesParams);
    const totalSales = totalSalesResult[0].total || 0;

    res.status(200).send({
      success: true,
      message: "Get all Dashboard",
      data: {
        userCount: userCount[0]["COUNT(id)"],
        activeUserCount: activeUserCount[0]["COUNT(id)"],
        newUsersThisPeriod: newUser[0]["COUNT(id)"],
        totalSales: totalSales,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Dashboard",
      error: error.message,
    });
  }
};

// get order information
exports.getOrderInformation = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const startDate = start_date ? new Date(start_date) : null;
    const endDate = end_date ? new Date(end_date) : null;

    // Query for total sales
    let salesQuery = "";
    let salesParams = [];

    let canceledQuery = "";
    let canceledParams = [];

    if (startDate && endDate) {
      salesQuery = `
        SELECT
        SUM(total_price) AS totalPrice,
        SUM(sub_total) AS subTotal,
        SUM(tax) AS totalTax,
        SUM(fees) AS totalFees,
        SUM(delivery_fee) AS deliveryFee,
        SUM(coupon_discount) AS couponDiscount
         FROM orders
        WHERE status != 'Canceled' AND created_at BETWEEN ? AND ?
      `;
      salesParams = [startDate, endDate];

      canceledQuery = `
        SELECT
        SUM(total_price) AS totalPrice FROM orders
        WHERE status = 'Canceled' AND created_at BETWEEN ? AND ?
      `;
      canceledParams = [startDate, endDate];
    } else {
      salesQuery = `
        SELECT
        SUM(total_price) AS totalPrice,
        SUM(sub_total) AS subTotal,
        SUM(tax) AS totalTax,
        SUM(fees) AS totalFees,
        SUM(delivery_fee) AS deliveryFee,
        SUM(coupon_discount) AS couponDiscount
         FROM orders
        WHERE status != 'Canceled' AND MONTH(created_at) = MONTH(CURRENT_DATE())
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
      `;

      canceledQuery = `
        SELECT
        SUM(total_price) AS totalPrice
         FROM orders
        WHERE  status = 'Canceled' AND MONTH(created_at) = MONTH(CURRENT_DATE())
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
      `;
    }

    const [totalSalesResult] = await db.query(salesQuery, salesParams);
    const [totalCanceledOrders] = await db.query(canceledQuery, canceledParams);

    res.status(200).send({
      success: true,
      message: "Get all Orders",
      data: {
        ...totalSalesResult[0],
        refunds: totalCanceledOrders[0].totalPrice || 0,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// exports.getFoodOrderInformation = async (req, res) => {
//   try {
//     const { start_date, end_date } = req.query;

//     const startDate = start_date ? new Date(start_date) : null;
//     const endDate = end_date ? new Date(end_date) : null;

//     // Step 1: Get all order IDs in given date range
//     let ordersQuery = "";
//     let ordersParams = [];

//     if (startDate && endDate) {
//       ordersQuery = `
//         SELECT id FROM orders
//         WHERE status != 'Canceled' AND created_at BETWEEN ? AND ?
//       `;
//       ordersParams = [startDate, endDate];
//     } else {
//       ordersQuery = `
//         SELECT id FROM orders
//         WHERE status != 'Canceled'
//         AND MONTH(created_at) = MONTH(CURRENT_DATE())
//         AND YEAR(created_at) = YEAR(CURRENT_DATE())
//       `;
//     }

//     const [orders] = await db.query(ordersQuery, ordersParams);

//     if (orders.length === 0) {
//       return res.status(200).send({
//         success: true,
//         message: "No orders found",
//         data: [],
//       });
//     }

//     const orderIds = orders.map((order) => order.id);

//     // Step 2: Aggregate food item data from orders_foods
//     const [foodSummary] = await db.query(
//       `
//       SELECT
//         food_details_id AS id,
//         name,
//         price,
//         SUM(quantity) AS quantity,
//         SUM(price * quantity) AS total_price
//       FROM orders_foods
//       WHERE order_id IN (?)
//       GROUP BY food_details_id, name, price
//       `,
//       [orderIds]
//     );

//     res.status(200).send({
//       success: true,
//       message: "Food order summary",
//       data: foodSummary,
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// get single food order
exports.getFoodOrderInformation = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const startDate = start_date ? new Date(start_date) : null;
    const endDate = end_date ? new Date(end_date) : null;

    // Query for order IDs
    let ordersQuery = "";
    let ordersParams = [];

    if (startDate && endDate) {
      ordersQuery = `
        SELECT id 
        FROM orders
        WHERE status != 'Canceled' AND created_at BETWEEN ? AND ?
      `;
      ordersParams = [startDate, endDate];
    } else {
      ordersQuery = `
        SELECT id
        FROM orders
        WHERE status != 'Canceled' AND MONTH(created_at) = MONTH(CURRENT_DATE())
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
      `;
    }

    const [orders] = await db.query(ordersQuery, ordersParams);

    // If no orders found, return empty array
    if (orders.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No orders found",
        data: [],
      });
    }

    // Get order IDs
    const orderIds = orders.map((order) => order.id);

    // Query to get food items from orders_foods table
    const [foodItems] = await db.query(
      `
      SELECT 
        food_details_id as id,
        name,
        price,
        SUM(quantity) as quantity,
        SUM(price * quantity) as total_price
      FROM orders_foods
      WHERE order_id IN (?)
      GROUP BY name
      ORDER BY quantity DESC
    `,
      [orderIds]
    );

    res.status(200).send({
      success: true,
      message: "Food order information retrieved successfully",
      length: foodItems.length,
      data: foodItems,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

exports.getYearlyOrders = async (req, res) => {
  try {
    const { year } = req.query;
    const currentDate = new Date();
    let monthsData = [];

    if (year) {
      // Year is provided - fetch data from Jan to Dec of that year
      for (let month = 0; month < 12; month++) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        const [result] = await db.query(
          `SELECT COUNT(*) as totalOrders, COALESCE(SUM(total_price), 0) as totalAmount 
           FROM orders 
           WHERE created_at BETWEEN ? AND ? AND status != 'Canceled'`,
          [startDate, endDate]
        );

        monthsData.push({
          month: monthNames[month],
          totalOrders: result[0].totalOrders,
          totalAmount: result[0].totalAmount,
        });
      }
    } else {
      // Year not provided - get past 12 months from current date
      for (let i = 0; i < 12; i++) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 11 + i,
          1
        );
        const month = date.getMonth();
        const year = date.getFullYear();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        const [result] = await db.query(
          `SELECT COUNT(*) as totalOrders, COALESCE(SUM(total_price), 0) as totalAmount 
           FROM orders 
           WHERE created_at BETWEEN ? AND ? AND status != 'Canceled'`,
          [startDate, endDate]
        );

        monthsData.push({
          month: `${monthNames[month]} ${year}`,
          totalOrders: result[0].totalOrders,
          totalAmount: result[0].totalAmount,
        });
      }
    }

    res.status(200).send({
      success: true,
      message: "Yearly Orders Data",
      data: monthsData,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
