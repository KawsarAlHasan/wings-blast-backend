const db = require("../config/db");

// create food Details
exports.createFoodDetails = async (req, res) => {
  try {
    const {
      category_id,
      name,
      price,
      cal,
      description,
      food_menu_id,
      food_menu_name,
      addons,
      drinks,
      beverages,
      sandCust,
      comboSide,
      ricePlatter,
    } = req.body;

    if (!category_id || !name || !price || !cal) {
      return res.status(400).send({
        success: false,
        message: "Please provide category_id, name, price & cal field",
      });
    }

    const images = req.file;
    let image = "";
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Parse and validate addons, sides, drinks, beverages
    const parsedAddons = addons ? JSON.parse(addons) : [];
    const parsedDrinks = drinks ? JSON.parse(drinks) : [];
    const parsedBeverages = beverages ? JSON.parse(beverages) : [];
    const parsedSandCust = sandCust ? JSON.parse(sandCust) : [];
    const parsedComboSide = comboSide ? JSON.parse(comboSide) : [];
    const parsedPlatterSides = ricePlatter ? JSON.parse(ricePlatter) : [];

    // Insert Food details into the database
    const [result] = await db.query(
      "INSERT INTO food_details (category_id, name, image, price, cal, description, food_menu_id, food_menu_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        category_id,
        name,
        image,
        price,
        cal || "",
        description || "",
        food_menu_id || 0,
        food_menu_name || "",
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Food Details, please try again",
      });
    }

    const food_details_id = result.insertId;

    // addons
    if (Array.isArray(parsedAddons) && parsedAddons.length > 0) {
      const foodAddonQuery =
        "INSERT INTO food_details_addons (food_details_id, type, how_many_select, how_many_choice, sn_number, is_extra_addon, is_required) VALUES ?";
      const foodDetailsValues = parsedAddons.map((fdv) => [
        food_details_id,
        fdv.type,
        fdv.how_many_select,
        fdv.how_many_choice,
        fdv.sn_number,
        fdv.is_extra_addon,
        fdv.is_required,
      ]);
      await db.query(foodAddonQuery, [foodDetailsValues]);
    }

    // drink
    if (Array.isArray(parsedDrinks) && parsedDrinks.length > 0) {
      const query =
        "INSERT INTO feature_for_food (food_details_id, type, type_id, isPaid) VALUES ?";
      const values = parsedDrinks.map((fff) => [
        food_details_id,
        "drink",
        fff.drink_id,
        fff.isPaid,
      ]);
      await db.query(query, [values]);
    }

    // beverage
    if (Array.isArray(parsedBeverages) && parsedBeverages.length > 0) {
      const query =
        "INSERT INTO feature_for_food (food_details_id, type, type_id, isPaid) VALUES ?";
      const values = parsedBeverages.map((fff) => [
        food_details_id,
        "beverage",
        fff.beverage_id,
        fff.isPaid,
      ]);
      await db.query(query, [values]);
    }

    // sandwich_customize
    if (Array.isArray(parsedSandCust) && parsedSandCust.length > 0) {
      const query =
        "INSERT INTO feature_for_food (food_details_id, type, type_id, isPaid) VALUES ?";
      const values = parsedSandCust.map((fff) => [
        food_details_id,
        "sandwich_customize",
        fff.sandCust_id,
        fff.isPaid,
      ]);
      await db.query(query, [values]);
    }

    // combo side
    if (Array.isArray(parsedComboSide) && parsedComboSide.length > 0) {
      const query =
        "INSERT INTO feature_for_food (food_details_id, type, type_id, isPaid) VALUES ?";
      const values = parsedComboSide.map((fff) => [
        food_details_id,
        "combo_side",
        fff.side_id,
        fff.isPaid,
      ]);
      await db.query(query, [values]);
    }

    // platerside
    if (Array.isArray(parsedPlatterSides) && parsedPlatterSides.length > 0) {
      const query =
        "INSERT INTO feature_for_food (food_details_id, type, type_id, isPaid) VALUES ?";
      const values = parsedPlatterSides.map((fff) => [
        food_details_id,
        "rice_platter",
        fff.side_id,
        fff.isPaid,
      ]);
      await db.query(query, [values]);
    }

    res.status(200).send({
      success: true,
      message: "Food Details inserted successfully",
      foodDetailsId: food_details_id,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Food Details",
      error: error.message,
    });
  }
};

// Get All FoodDetails for user
exports.getAllFoodDetailsForUser = async (req, res) => {
  try {
    // Extract query parameters
    const {
      page = 1,
      limit = 20,
      status,
      name,
      category_id,
      food_menu_id,
    } = req.query;

    // Calculate the offset for pagination
    const offset = (page - 1) * limit;

    // Start building the query with the main food details table
    let query = "SELECT * FROM food_details WHERE 1=1";
    const queryParams = [];

    // Append conditions to the query based on the provided filters
    if (name) {
      query += " AND name LIKE ?";
      queryParams.push(`%${name}%`); // For partial matching on name
    }

    if (category_id) {
      query += " AND category_id = ?";
      queryParams.push(category_id);
    }

    if (food_menu_id) {
      query += " AND food_menu_id = ?";
      queryParams.push(food_menu_id);
    }

    query += " AND status = ?";
    queryParams.push("active");

    // Add pagination using LIMIT and OFFSET
    query += " LIMIT ? OFFSET ?";
    queryParams.push(Number(limit), Number(offset));

    // Execute the query with parameters
    const [foodDetails] = await db.query(query, queryParams);

    // If no data found, send an empty response
    if (foodDetails.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No food details found",
        data: [],
      });
    }

    // Get total count for pagination metadata
    const countQuery = "SELECT COUNT(*) AS total FROM food_details WHERE 1=1";
    const [countResult] = await db.query(countQuery, queryParams.slice(0, -2)); // Exclude LIMIT and OFFSET

    const total = countResult[0].total;

    // Send success response with paginated food details and metadata
    res.status(200).send({
      success: true,
      message: "Food details retrieved successfully",
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: foodDetails,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while retrieving the Food Details",
      error: error.message,
    });
  }
};

// Get All FoodDetails
exports.getAllFoodDetails = async (req, res) => {
  try {
    // Extract query parameters
    const {
      page = 1,
      limit = 20,
      status,
      name,
      category_id,
      food_menu_id,
    } = req.query;

    // Calculate the offset for pagination
    const offset = (page - 1) * limit;

    // Start building the query with the main food details table
    let query = "SELECT * FROM food_details WHERE 1=1";
    const queryParams = [];

    // Append conditions to the query based on the provided filters
    if (name) {
      query += " AND name LIKE ?";
      queryParams.push(`%${name}%`); // For partial matching on name
    }

    if (category_id) {
      query += " AND category_id = ?";
      queryParams.push(category_id);
    }

    if (food_menu_id) {
      query += " AND food_menu_id = ?";
      queryParams.push(food_menu_id);
    }

    if (status) {
      query += " AND status = ?";
      queryParams.push(status);
    }

    // Add pagination using LIMIT and OFFSET
    query += " LIMIT ? OFFSET ?";
    queryParams.push(Number(limit), Number(offset));

    // Execute the query with parameters
    const [foodDetails] = await db.query(query, queryParams);

    // If no data found, send an empty response
    if (foodDetails.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No food details found",
        data: [],
      });
    }

    // Get total count for pagination metadata
    const countQuery = "SELECT COUNT(*) AS total FROM food_details WHERE 1=1";
    const [countResult] = await db.query(countQuery, queryParams.slice(0, -2)); // Exclude LIMIT and OFFSET

    const total = countResult[0].total;

    // Send success response with paginated food details and metadata
    res.status(200).send({
      success: true,
      message: "Food details retrieved successfully",
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: foodDetails,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while retrieving the Food Details",
      error: error.message,
    });
  }
};

// Get Single FoodDetails
exports.getSingleFoodDetails = async (req, res) => {
  try {
    const id = req.params.id;

    // Retrieve food details from the main table
    const [foodDetails] = await db.query(
      "SELECT * FROM food_details WHERE id =?",
      [id]
    );

    // If no data found, send an empty response
    if (foodDetails.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No food details found",
        data: {},
      });
    }

    const [addons] = await db.query(
      "SELECT * FROM food_details_addons WHERE food_details_id=? ORDER BY sn_number ASC",
      [id]
    );

    const feature = {};

    for (const addon of addons) {
      if (addon.type === "Flavor") {
        if (addon.how_many_select > 0) {
          const [flavorRows] = await db.query(
            "SELECT * FROM flavor ORDER BY sn_number ASC"
          );

          feature["flavor"] = {
            ...addon,
            data: flavorRows,
          };
        }
      }

      if (addon.type === "Dip") {
        if (addon.how_many_select > 0) {
          const [rows] = await db.query("SELECT * FROM dip");

          feature["dip"] = {
            ...addon,
            data: rows,
          };
        }
      }

      if (addon.type === "Combo Side") {
        if (addon.how_many_select > 0) {
          const [rows] = await db.query(
            `SELECT
            fff.type_id AS id,
            sd.name,
            sd.image,
            sd.cal,
            sd.price,
            fff.isPaid
            FROM feature_for_food fff
            LEFT JOIN side sd ON fff.type_id = sd.id
            WHERE fff.food_details_id = ? AND fff.type = ?`,
            [id, "combo_side"]
          );

          feature["side"] = {
            ...addon,
            data: rows,
          };
        }
      }

      if (addon.type === "Drink") {
        const [rows] = await db.query(
          `SELECT 
          fff.type_id AS id,
          dr.name,
          dr.image,
          dr.cal,
          dr.price,
          fff.isPaid
          FROM feature_for_food fff
          LEFT JOIN drink dr ON fff.type_id = dr.id
          WHERE fff.food_details_id = ? AND fff.type = ?`,
          [id, "drink"]
        );

        feature["drink"] = {
          ...addon,
          data: rows,
        };
      }

      if (addon.type === "Bakery") {
        const [rows] = await db.query(
          `SELECT
          fff.type_id AS id,
          bvrg.name,
          bvrg.image,
          bvrg.cal,
          bvrg.price,
          fff.isPaid
          FROM feature_for_food fff
          LEFT JOIN beverage bvrg ON fff.type_id = bvrg.id
          WHERE fff.food_details_id = ? AND fff.type = ?`,
          [id, "beverage"]
        );

        feature["bakery"] = {
          ...addon,
          data: rows,
        };
      }

      if (addon.type === "Rice Platter") {
        const [rows] = await db.query(
          `SELECT
          fff.type_id AS id,
          sd.name,
          sd.image,
          sd.cal,
          sd.price,
          fff.isPaid
          FROM feature_for_food fff
          LEFT JOIN side sd ON fff.type_id = sd.id
          WHERE fff.food_details_id = ? AND fff.type = ?`,
          [id, "rice_platter"]
        );

        feature["ricePlatter"] = {
          ...addon,
          data: rows,
        };
      }

      if (addon.type === "Sandwich Customize") {
        const [rows] = await db.query(
          `SELECT
          fff.type_id AS id,
          sc.name,
          sc.image,
          sc.cal,
          sc.price,
          fff.isPaid
          FROM feature_for_food fff
          LEFT JOIN sandwich_customize sc ON fff.type_id = sc.id
          WHERE fff.food_details_id = ? AND fff.type = ?`,
          [id, "sandwich_customize"]
        );

        feature["sandwichCustomize"] = {
          ...addon,
          data: rows,
        };
      }

      if (addon.type === "Topping") {
        if (addon.how_many_select > 0) {
          const [rows] = await db.query("SELECT * FROM toppings");

          feature["topping"] = {
            ...addon,
            data: rows,
          };
        }
      }
    }

    const foodInfo = {
      ...foodDetails[0],
      ...feature,
    };

    // Send success response with all food details
    res.status(200).send({
      success: true,
      message: "Food details retrieved successfully",
      data: foodInfo,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while retrieving the Food Details",
      error: error.message,
    });
  }
};

// Update food Details
exports.updateFoodDetails = async (req, res) => {
  try {
    const food_details_id = req.params.id;

    const {
      category_id,
      name,
      price,
      cal,
      description,
      food_menu_id,
      food_menu_name,
      addons,
      drinks,
      beverages,
      sandCust,
      comboSide,
      ricePlatter,
    } = req.body;

    // Parse and validate addons, sides, drinks, beverages
    const parsedAddons = addons ? JSON.parse(addons) : [];
    const parsedDrinks = drinks ? JSON.parse(drinks) : [];
    const parsedBeverages = beverages ? JSON.parse(beverages) : [];
    const parsedSandCust = sandCust ? JSON.parse(sandCust) : [];
    const parsedComboSide = comboSide ? JSON.parse(comboSide) : [];
    const parsedPlatterSides = ricePlatter ? JSON.parse(ricePlatter) : [];

    // Retrieve food details from the main table
    const [preDoodDetails] = await db.query(
      "SELECT * FROM food_details WHERE id =?",
      [food_details_id]
    );

    // If no data found, send an empty response
    if (preDoodDetails.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No food details found",
        data: {},
      });
    }

    const images = req.file;
    let image = preDoodDetails[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Update Food details into the database
    const [result] = await db.query(
      `UPDATE food_details SET
        category_id = ?, name = ?, image = ?, price = ?, cal = ?, description = ?,
        food_menu_id = ?, food_menu_name = ?
      WHERE id = ?`,
      [
        category_id || preDoodDetails[0].category_id,
        name || preDoodDetails[0].name,
        image,
        price || preDoodDetails[0].price,
        cal || preDoodDetails[0].cal,
        description || preDoodDetails[0].description,
        food_menu_id || preDoodDetails[0].food_menu_id,
        food_menu_name || preDoodDetails[0].food_menu_name,
        food_details_id,
      ]
    );

    await db.query(`DELETE FROM feature_for_food WHERE food_details_id = ?`, [
      food_details_id,
    ]);

    await db.query(
      `DELETE FROM food_details_addons WHERE food_details_id = ?`,
      [food_details_id]
    );

    // addons
    if (Array.isArray(parsedAddons) && parsedAddons.length > 0) {
      const foodAddonQuery =
        "INSERT INTO food_details_addons (food_details_id, type, how_many_select, how_many_choice, sn_number, is_extra_addon, is_required) VALUES ?";
      const foodDetailsValues = parsedAddons.map((fdv) => [
        food_details_id,
        fdv.type,
        fdv.how_many_select,
        fdv.how_many_choice,
        fdv.sn_number,
        fdv.is_extra_addon,
        fdv.is_required,
      ]);
      await db.query(foodAddonQuery, [foodDetailsValues]);
    }

    // drink
    if (Array.isArray(parsedDrinks) && parsedDrinks.length > 0) {
      const query =
        "INSERT INTO feature_for_food (food_details_id, type, type_id, isPaid) VALUES ?";
      const values = parsedDrinks.map((fff) => [
        food_details_id,
        "drink",
        fff.drink_id,
        fff.isPaid,
      ]);
      await db.query(query, [values]);
    }

    // beverage
    if (Array.isArray(parsedBeverages) && parsedBeverages.length > 0) {
      const query =
        "INSERT INTO feature_for_food (food_details_id, type, type_id, isPaid) VALUES ?";
      const values = parsedBeverages.map((fff) => [
        food_details_id,
        "beverage",
        fff.beverage_id,
        fff.isPaid,
      ]);
      await db.query(query, [values]);
    }

    // sandwich_customize
    if (Array.isArray(parsedSandCust) && parsedSandCust.length > 0) {
      const query =
        "INSERT INTO feature_for_food (food_details_id, type, type_id, isPaid) VALUES ?";
      const values = parsedSandCust.map((fff) => [
        food_details_id,
        "sandwich_customize",
        fff.sandCust_id,
        fff.isPaid,
      ]);
      await db.query(query, [values]);
    }

    // combo side
    if (Array.isArray(parsedComboSide) && parsedComboSide.length > 0) {
      const query =
        "INSERT INTO feature_for_food (food_details_id, type, type_id, isPaid) VALUES ?";
      const values = parsedComboSide.map((fff) => [
        food_details_id,
        "combo_side",
        fff.side_id,
        fff.isPaid,
      ]);
      await db.query(query, [values]);
    }

    // platerside
    if (Array.isArray(parsedPlatterSides) && parsedPlatterSides.length > 0) {
      const query =
        "INSERT INTO feature_for_food (food_details_id, type, type_id, isPaid) VALUES ?";
      const values = parsedPlatterSides.map((fff) => [
        food_details_id,
        "rice_platter",
        fff.side_id,
        fff.isPaid,
      ]);
      await db.query(query, [values]);
    }

    const [data] = await db.query(
      `SELECT * FROM card WHERE food_details_id=? `,
      [food_details_id]
    );

    for (const singleData of data) {
      const card_id = singleData.id;
      await db.query(`DELETE FROM card_addons WHERE card_id=?`, [card_id]);
      await db.query(`DELETE FROM flavers_for_card WHERE card_id=?`, [card_id]);
      await db.query(`DELETE FROM toppings_for_card WHERE card_id=?`, [
        card_id,
      ]);
      await db.query(`DELETE FROM sandCust_for_card WHERE card_id=?`, [
        card_id,
      ]);
    }

    await db.query(`DELETE FROM card WHERE food_details_id=?`, [
      food_details_id,
    ]);

    res.status(200).send({
      success: true,
      message: "Food Details updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while updating the Food Details",
      error: error.message,
    });
  }
};

// delete Food Details
exports.deleteFoodDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const [foodDetails] = await db.query(
      "SELECT * FROM food_details WHERE id =?",
      [id]
    );

    if (foodDetails.length === 0) {
      return res.status(201).send({
        success: true,
        message: "No food details found",
      });
    }

    await db.query(`DELETE FROM feature_for_food WHERE food_details_id = ?`, [
      id,
    ]);
    await db.query(
      `DELETE FROM food_details_addons WHERE food_details_id = ?`,
      [id]
    );

    // Proceed to delete the food_menu
    const [result] = await db.query(`DELETE FROM food_details WHERE id = ?`, [
      id,
    ]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete food_menu",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "food_menu deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting food_menu",
      error: error.message,
    });
  }
};

// update food details status
exports.foodDetailStatus = async (req, res) => {
  try {
    const food_details_id = req.params.id;

    const { status, status_deactivate_date } = req.body;

    const [data] = await db.query(`SELECT * FROM food_details WHERE id=? `, [
      food_details_id,
    ]);
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No food details found",
      });
    }

    const [updateData] = await db.query(
      `UPDATE food_details SET status=?, status_deactivate_date=?  WHERE id =?`,
      [
        status || data[0].status,
        status_deactivate_date || null,
        food_details_id,
      ]
    );

    res.status(200).send({
      success: true,
      message: "food details status updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update food details status ",
      error: error.message,
    });
  }
};
