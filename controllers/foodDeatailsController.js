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

    // Parse and validate dips, sides, drinks, beverages
    const parsedAddons = addons ? JSON.parse(addons) : [];
    const parsedDrinks = drinks ? JSON.parse(drinks) : [];
    const parsedBeverages = beverages ? JSON.parse(beverages) : [];
    const parsedSandCust = sandCust ? JSON.parse(sandCust) : [];
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

    // platerside
    if (Array.isArray(parsedPlatterSides) && parsedPlatterSides.length > 0) {
      const query =
        "INSERT INTO feature_for_food (food_details_id, type, type_id, isPaid) VALUES ?";
      const values = parsedPlatterSides.map((fff) => [
        food_details_id,
        "side",
        fff.side_id,
        fff.isPaid,
      ]);
      await db.query(query, [values]);
    }

    // // platerside_for_food
    // if (Array.isArray(parsedPlatterSides) && parsedPlatterSides.length > 0) {
    //   const platterSideQuery =
    //     "INSERT INTO platerside_for_food (food_details_id, platerSide_id, isPaid) VALUES ?";
    //   const platterValues = parsedPlatterSides.map((platerSide) => [
    //     food_details_id,
    //     platerSide.platerSide_id,
    //     platerSide.isPaid,
    //   ]);
    //   await db.query(platterSideQuery, [platterValues]);
    // }

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
      "SELECT * FROM food_details_addons WHERE food_details_id=?",
      [id]
    );

    const [featureForFood] = await db.query(
      "SELECT * FROM feature_for_food WHERE food_details_id = ?",
      [id]
    );

    const groupedByType = [];
    featureForFood.forEach((item) => {
      if (!groupedByType[item.type]) {
        groupedByType[item.type] = [];
      }
      groupedByType[item.type].push({ id: item.type_id, isPaid: item.isPaid });
    });

    const finalResult = {};

    for (const type in groupedByType) {
      const idObjects = groupedByType[type];

      const ids = idObjects.map((obj) => obj.id);
      const placeholders = ids.map(() => "?").join(",");

      const query = `SELECT * FROM \`${type}\` WHERE id IN (${placeholders})`;

      const [rows] = await db.query(query, ids);

      const rowsWithIsPaid = rows.map((row) => {
        const matched = idObjects.find((obj) => obj.id === row.id);
        return {
          ...row,
          isPaid: matched ? matched.isPaid : null,
        };
      });

      finalResult[type] = rowsWithIsPaid;
    }

    const foodInfo = {
      ...foodDetails[0],
      addons,
      ...finalResult,
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
      howManyFlavor,
      howManyChoiceFlavor,
      howManyDips,
      howManyChoiceDips,
      dips,
      sides,
      drinks,
      beverages,
      toppings,
      sandCust,
      platter_sides,
      food_menu_id,
      food_menu_name,
    } = req.body;

    // Parse and validate dips, sides, drinks, beverages
    const parsedDips = dips ? JSON.parse(dips) : [];
    const parsedSides = sides ? JSON.parse(sides) : [];
    const parsedDrinks = drinks ? JSON.parse(drinks) : [];
    const parsedBeverages = beverages ? JSON.parse(beverages) : [];
    const parsedToppings = toppings ? JSON.parse(toppings) : [];
    const parsedSandCust = sandCust ? JSON.parse(sandCust) : [];
    const parsedPlatterSides = platter_sides ? JSON.parse(platter_sides) : [];

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
        howManyFlavor = ?, howManyChoiceFlavor = ?, howManyDips = ?, howManyChoiceDips = ?,
        food_menu_id = ?, food_menu_name = ?
      WHERE id = ?`,
      [
        category_id || preDoodDetails[0].category_id,
        name || preDoodDetails[0].name,
        image,
        price || preDoodDetails[0].price,
        cal || preDoodDetails[0].cal,
        description || preDoodDetails[0].description,
        howManyFlavor || preDoodDetails[0].howManyFlavor,
        howManyChoiceFlavor || preDoodDetails[0].howManyChoiceFlavor,
        howManyDips || preDoodDetails[0].howManyDips,
        howManyChoiceDips || preDoodDetails[0].howManyChoiceDips,
        food_menu_id || preDoodDetails[0].food_menu_id,
        food_menu_name || preDoodDetails[0].food_menu_name,
        food_details_id,
      ]
    );

    await db.query(`DELETE FROM dip_for_food WHERE food_details_id = ?`, [
      food_details_id,
    ]);

    await db.query(`DELETE FROM side_for_food WHERE food_details_id = ?`, [
      food_details_id,
    ]);

    await db.query(`DELETE FROM drink_for_food WHERE food_details_id = ?`, [
      food_details_id,
    ]);

    await db.query(`DELETE FROM beverage_for_food WHERE food_details_id = ?`, [
      food_details_id,
    ]);

    await db.query(`DELETE FROM toppings_for_food WHERE food_details_id = ?`, [
      food_details_id,
    ]);

    await db.query(`DELETE FROM sandCust_for_food WHERE food_details_id = ?`, [
      food_details_id,
    ]);

    await db.query(
      `DELETE FROM platerside_for_food WHERE food_details_id = ?`,
      [food_details_id]
    );

    // dip
    if (Array.isArray(parsedDips) && parsedDips.length > 0) {
      const dipQuery =
        "INSERT INTO dip_for_food (food_details_id, dip_id, isPaid) VALUES ?";
      const dipValues = parsedDips.map((dip) => [
        food_details_id,
        dip.dip_id,
        dip.isPaid,
      ]);
      await db.query(dipQuery, [dipValues]);
    }

    // side
    if (Array.isArray(parsedSides) && parsedSides.length > 0) {
      const sideQuery =
        "INSERT INTO side_for_food (food_details_id, side_id, isPaid) VALUES ?";
      const sideValues = parsedSides.map((side) => [
        food_details_id,
        side.side_id,
        side.isPaid,
      ]);
      await db.query(sideQuery, [sideValues]);
    }

    // drink
    if (Array.isArray(parsedDrinks) && parsedDrinks.length > 0) {
      const drinkQuery =
        "INSERT INTO drink_for_food (food_details_id, drink_id, isPaid) VALUES ?";
      const drinkValues = parsedDrinks.map((drink) => [
        food_details_id,
        drink.drink_id,
        drink.isPaid,
      ]);
      await db.query(drinkQuery, [drinkValues]);
    }

    // beverages
    if (Array.isArray(parsedBeverages) && parsedBeverages.length > 0) {
      const beverageQuery =
        "INSERT INTO beverage_for_food (food_details_id, beverage_id, isPaid) VALUES ?";
      const beverageValues = parsedBeverages.map((beverage) => [
        food_details_id,
        beverage.beverage_id,
        beverage.isPaid,
      ]);
      await db.query(beverageQuery, [beverageValues]);
    }

    // toppings
    if (Array.isArray(parsedToppings) && parsedToppings.length > 0) {
      const toppingQuery =
        "INSERT INTO toppings_for_food (food_details_id, toppings_id, isPaid) VALUES ?";
      const toppingValues = parsedToppings.map((toppings) => [
        food_details_id,
        toppings.toppings_id,
        toppings.isPaid,
      ]);
      await db.query(toppingQuery, [toppingValues]);
    }

    // sandCust_for_food
    if (Array.isArray(parsedSandCust) && parsedSandCust.length > 0) {
      const sandCustQuery =
        "INSERT INTO sandCust_for_food (food_details_id, sandCust_id, isPaid) VALUES ?";
      const sandCustValues = parsedSandCust.map((sandCust) => [
        food_details_id,
        sandCust.sandCust_id,
        sandCust.isPaid,
      ]);
      await db.query(sandCustQuery, [sandCustValues]);
    }

    // platerside_for_food
    if (Array.isArray(parsedPlatterSides) && parsedPlatterSides.length > 0) {
      const platterSideQuery =
        "INSERT INTO platerside_for_food (food_details_id, platerSide_id, isPaid) VALUES ?";
      const platterValues = parsedPlatterSides.map((platerSide) => [
        food_details_id,
        platerSide.platerSide_id,
        platerSide.isPaid,
      ]);
      await db.query(platterSideQuery, [platterValues]);
    }

    await db.query(`DELETE FROM flavers_for_card`);
    await db.query(`DELETE FROM toppings_for_card`);
    await db.query(`DELETE FROM sandCust_for_card`);
    await db.query(`DELETE FROM card`);

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
