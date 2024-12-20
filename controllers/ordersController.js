const db = require("../config/db");
const { sendMail } = require("../middleware/sandEmail");
const { supportEmail } = require("../middleware/supportEmail");

// create Orders
exports.createOrders = async (req, res) => {
  const {
    user_id,
    guest_user_id,
    first_name,
    last_name,
    phone,
    email,
    delivery_type,
    delevery_address,
    building_suite_apt,
    sub_total,
    tax,
    fees,
    delivery_fee,
    tips,
    coupon_discount,
    total_price,
    isLater,
    later_date,
    later_slot,
    foods,
  } = req.body;
  try {
    const laterDate = new Date(later_date);
    const newDate = new Date();

    // Generate unique Order Id
    async function generateUniqueOrderId(length, batchSize = 6) {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

      // Helper function to generate a single random code
      function generateRandomCode(length) {
        let result = "";
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          result += characters[randomIndex];
        }
        return result;
      }

      let uniqueCode = null;

      while (!uniqueCode) {
        // Step 1: Generate a batch of random codes
        const codesBatch = [];
        for (let i = 0; i < batchSize; i++) {
          codesBatch.push(generateRandomCode(length));
        }

        // Step 2: Check these codes against the database
        const placeholders = codesBatch.map(() => "?").join(",");
        const [existingCodes] = await db.query(
          `SELECT order_id FROM orders WHERE order_id IN (${placeholders})`,
          codesBatch
        );

        // Step 3: Filter out codes that already exist in the database
        const existingCodeSet = new Set(
          existingCodes.map((row) => row.order_id)
        );

        // Step 4: Find the first code that doesn't exist in the database
        uniqueCode = codesBatch.find((code) => !existingCodeSet.has(code));
      }

      return uniqueCode;
    }

    // Generate unique Order Id (if not provided)
    const order_id = await generateUniqueOrderId(6);

    // Insert order into the 'orders' table
    const [orderResult] = await db.query(
      "INSERT INTO orders (order_id, user_id, first_name, last_name, phone, email, delivery_type, delevery_address, building_suite_apt, sub_total, tax, fees, delivery_fee, tips, coupon_discount, total_price, isLater, later_date, later_slot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        order_id,
        user_id,
        first_name || "",
        last_name || "",
        phone,
        email,
        delivery_type || "",
        delevery_address || "",
        building_suite_apt || "",
        sub_total || 0,
        tax || 0,
        fees || 0,
        delivery_fee || 0,
        tips || 0,
        coupon_discount || 0,
        total_price,
        isLater || 0,
        laterDate || newDate,
        later_slot || "",
      ]
    );

    const orderId = orderResult.insertId;

    // Insert each food item and its addons into the 'foods' and 'addons' tables
    for (const food of foods) {
      const { name, image, price, quantity, description, addons } = food;

      // Insert food into the 'foods' table
      const [foodResult] = await db.query(
        "INSERT INTO orders_foods (order_id, name, image, price, quantity, description) VALUES (?, ?, ?, ?, ?, ?)",
        [orderId, name, image, price, quantity, description]
      );

      const foodId = foodResult.insertId;
      // Insert addons into the 'addons' table
      if (addons) {
        for (const type in addons) {
          const items = addons[type];
          for (const item of items) {
            const { name, image, price, quantity, rating, isPaid } = item;

            if (!name) continue;

            await db.query(
              "INSERT INTO addons (food_id, type, name, image, price, quantity, rating, isPaid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [
                foodId,
                type,
                name,
                image,
                price || 0,
                quantity || 1,
                rating || null,
                isPaid || false,
              ]
            );
          }
        }
      }
    }

    if (orderId) {
      // Notification Details
      const type = "Admin";
      const receiver_id = 1;
      const sander_id = user_id;
      const url = `/order/${orderId}`;
      const title = "New Order Placed";
      const message = `A new order has been placed by ${first_name} ${last_name}. Order ID: ${orderId}. Please review the details.`;

      // Insert Notification for Each Admin
      const [notification] = await db.query(
        "INSERT INTO notifications (type, receiver_id, sander_id, url, title, message) VALUES (?, ?, ?, ?, ?, ?)",
        [type, receiver_id, sander_id, url, title, message]
      );

      // Access Socket.io instance
      const io = req.app.get("socketio");
      if (!io) {
        throw new Error("Socket.io is not initialized");
      }

      // Emit notification
      io.emit("receiveNotification", {
        id: notification.insertId,
        type,
        orderId,
        url,
        title,
        message,
      });

      // send mail
      const emailData = {
        first_name,
        last_name,
        order_id,
        phone,
        email,
        delivery_type,
        delevery_address,
        sub_total,
        tax,
        fees,
        delivery_fee,
        tips,
        coupon_discount,
        total_price,
        later_date,
        later_slot,
        foods,
      };

      const emailResult = await sendMail(emailData);
      if (!emailResult.messageId) {
        res.status(500).send("Failed to send email");
      }

      // delete card Data
      const [cardData] = await db.query(
        `SELECT * FROM card WHERE guest_user_id = ?`,
        [guest_user_id]
      );
      for (const singleData of cardData) {
        const card_id = singleData.id;
        await db.query(`DELETE FROM flavers_for_card WHERE card_id=?`, [
          card_id,
        ]);
        await db.query(`DELETE FROM toppings_for_card WHERE card_id=?`, [
          card_id,
        ]);
        await db.query(`DELETE FROM sandCust_for_card WHERE card_id=?`, [
          card_id,
        ]);
      }
      await db.query(`DELETE FROM card WHERE guest_user_id=?`, [guest_user_id]);
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Order inserted successfully",
    });
  } catch (error) {
    const emailData = {
      email,
      subject: "Order Processing Error",
      message: `We encountered an error while processing your order. Please contact support with the provided email.`,
    };
    const emailResult = await supportEmail(emailData);

    if (!emailResult.messageId) {
      res.status(500).send("Failed to send email");
    }

    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the order",
      error: error.message,
    });
  }
};

// get all Orders with pagination, filtering, and search
exports.getAllOrders = async (req, res) => {
  try {
    // Get query parameters for pagination, filtering, and searching
    const { page = 1, limit = 20, status, order_id } = req.query;

    // Calculate the offset for pagination
    const offset = (page - 1) * limit;

    // Build the base SQL query
    let query = "SELECT * FROM orders";
    let conditions = [];
    let queryParams = [];

    // Add status filter if provided
    if (status) {
      conditions.push("status = ?");
      queryParams.push(status);
    }

    // Add order_id search if provided
    if (order_id) {
      conditions.push("order_id LIKE ?");
      queryParams.push(`%${order_id}%`);
    }

    // Add conditions to the query if any
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // Add ordering and pagination
    query += " ORDER BY id DESC LIMIT ? OFFSET ?";
    queryParams.push(parseInt(limit), parseInt(offset));

    // Execute the query
    const [orders] = await db.query(query, queryParams);

    // Get the total count of orders (without pagination)
    let countQuery = "SELECT COUNT(*) as total FROM orders";
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
    }
    const [countResult] = await db.query(countQuery, queryParams.slice(0, -2)); // Exclude limit & offset from count query
    const total = countResult[0].total;

    // Send response with the structured order data
    res.status(200).send({
      success: true,
      message: "Get all Orders",
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Orders",
      error: error.message,
    });
  }
};

// get singe order
exports.getSingleOrder = async (req, res) => {
  try {
    // Get order_id from request parameters
    const order_id = req.params.id;

    // Get the specific order from the orders table
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [
      order_id,
    ]);

    // If no order is found, return an error message
    if (orders.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders[0]; // Since we are fetching only one order

    // Get all foods related to the current order
    const [foods] = await db.query(
      "SELECT * FROM orders_foods WHERE order_id = ?",
      [order.id]
    );

    // Loop through each food item to get its addons by type
    for (const food of foods) {
      // Get all addons for the current food item, grouped by type
      const [addons] = await db.query(
        "SELECT * FROM addons WHERE food_id = ?",
        [food.id]
      );

      // Structure addons in food object by type
      food.addons = {
        flavor: addons
          .filter((addon) => addon.type === "flavor")
          .map((flavor) => ({
            name: flavor.name,
            image: flavor.image,
            quantity: flavor.quantity,
            rating: flavor.rating,
          })),
        toppings: addons
          .filter((addon) => addon.type === "toppings")
          .map((toppings) => ({
            name: toppings.name,
            image: toppings.image,
            price: toppings.price,
            isPaid: toppings.isPaid,
          })),
        sandCust: addons
          .filter((addon) => addon.type === "sandCust")
          .map((sandCust) => ({
            name: sandCust.name,
            image: sandCust.image,
            price: sandCust.price,
            isPaid: sandCust.isPaid,
          })),
        dip: addons
          .filter((addon) => addon.type === "dip")
          .map((dip) => ({
            name: dip.name,
            image: dip.image,
            price: dip.price,
            isPaid: dip.isPaid,
          })),
        side: addons
          .filter((addon) => addon.type === "side")
          .map((side) => ({
            name: side.name,
            image: side.image,
            price: side.price,
            isPaid: side.isPaid,
          })),
        drink: addons
          .filter((addon) => addon.type === "drink")
          .map((drink) => ({
            name: drink.name,
            image: drink.image,
            price: drink.price,
            isPaid: drink.isPaid,
          })),
        beverage: addons
          .filter((addon) => addon.type === "beverage")
          .map((beverage) => ({
            name: beverage.name,
            image: beverage.image,
            price: beverage.price,
            isPaid: beverage.isPaid,
          })),
      };
    }

    // Attach foods with addons to the order
    order.foods = foods;

    // Send response with the structured order data
    res.status(200).send({
      success: true,
      message: "Get Single Order",
      data: order,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single Order",
      error: error.message,
    });
  }
};

// get user order
exports.getUserOrders = async (req, res) => {
  try {
    // Get user_id from request parameters
    const { user_id } = req.params;

    // Fetch all orders for the specific user from the orders table
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
      [user_id]
    );

    // If no orders found, return a message
    if (orders.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No orders found for this user",
      });
    }

    // Send response with the structured orders data
    res.status(200).send({
      success: true,
      message: "Get all orders for the user",
      data: orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting user orders",
      error: error.message,
    });
  }
};

// update order status
exports.orderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(404).send({
        success: false,
        message: "order Id is required in params",
      });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(404).send({
        success: false,
        message: "status is requied in body",
      });
    }

    const [data] = await db.query(`SELECT * FROM orders WHERE id=? `, [
      orderId,
    ]);
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No Order found",
      });
    }

    const [updateData] = await db.query(
      `UPDATE orders SET status=?  WHERE id =?`,
      [status, orderId]
    );

    if (updateData.changedRows) {
      // Notification Details
      const type = "User";
      const receiver_id = data[0].user_id;
      const sander_id = 1;
      const url = `/orderdetails/${data[0].id}`;

      // Define notification title and message based on order status
      let title = "Order Status Updated";
      let message = "";

      switch (status) {
        case "Pending":
          message =
            "Your order is now pending. We'll notify you once it progresses.";
          break;
        case "Processing":
          message =
            "Your order is currently being processed. Please wait for further updates.";
          break;
        case "Completed":
          message =
            "Congratulations! Your order has been successfully completed.";
          break;
        case "Cancelled":
          message =
            "We're sorry to inform you that your order has been cancelled.";
          break;
        default:
          message =
            "The status of your order has been updated. Please check the details.";
      }

      // Insert Notification for User
      const [notification] = await db.query(
        "INSERT INTO notifications (type, receiver_id, sander_id, url, title, message) VALUES (?, ?, ?, ?, ?, ?)",
        [type, receiver_id, sander_id, url, title, message]
      );
    }

    res.status(200).send({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update order status ",
      error: error.message,
    });
  }
};
