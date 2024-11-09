const db = require("../config/db");

// create Orders
exports.createOrders = async (req, res) => {
  try {
    const {
      user_id,
      sub_total,
      tax,
      total_price,
      isLater,
      later_date,
      later_slot,
      status,
      foods,
    } = req.body;

    // Insert order into the 'orders' table
    const [orderResult] = await db.query(
      "INSERT INTO orders (user_id, sub_total, tax, total_price, isLater, later_date, later_slot, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user_id,
        sub_total,
        tax,
        total_price,
        isLater,
        later_date,
        later_slot,
        status,
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

    // Send success response
    res.status(200).send({
      success: true,
      message: "Order inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the order",
      error: error.message,
    });
  }
};

// get all Orders
exports.getAllOrders = async (req, res) => {
  try {
    // Get all orders from the orders table
    const [orders] = await db.query("SELECT * FROM orders");

    for (const order of orders) {
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
    }

    // Send response with the structured order data
    res.status(200).send({
      success: true,
      message: "Get all Orders",
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

exports.getUserOrders = async (req, res) => {
  try {
    // Get user_id from request parameters
    const { user_id } = req.params;

    // Fetch all orders for the specific user from the orders table
    const [orders] = await db.query("SELECT * FROM orders WHERE user_id = ?", [
      user_id,
    ]);

    // If no orders found, return a message
    if (orders.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No orders found for this user",
      });
    }

    // Loop through each order to get related foods and their addons
    for (const order of orders) {
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
