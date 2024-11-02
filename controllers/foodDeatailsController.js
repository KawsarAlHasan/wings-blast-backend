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
      howManyFlavor,
      howManyChoiceFlavor,
      howManyChoiceSide,
      howManyChoiceDip,
      howManyChoiceDrink,
      howManyChoiceBeverage,
      dips,
      sides,
      drinks,
      beverages,
      food_menu_id,
      food_menu_name,
      food_menu_price,
      food_menu_cal,
    } = req.body;

    if (
      !category_id ||
      !food_menu_id ||
      !name ||
      !price ||
      !cal ||
      !howManyFlavor ||
      !howManyChoiceFlavor
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Please provide category_id, food_menu_id, name, price, cal, howManyFlavor & howManyChoiceFlavor field",
      });
    }

    const images = req.file;
    let image = "";
    if (images && images.path) {
      image = `/public/images/${images.filename}`;
    }

    // Parse and validate dips, sides, drinks, beverages
    const parsedDips = dips ? JSON.parse(dips) : [];
    const parsedSides = sides ? JSON.parse(sides) : [];
    const parsedDrinks = drinks ? JSON.parse(drinks) : [];
    const parsedBeverages = beverages ? JSON.parse(beverages) : [];

    // Insert Menu Food into the database
    const [result] = await db.query(
      "INSERT INTO food_details (category_id, name, image, price, cal, description, howManyFlavor, howManyChoiceFlavor, howManyChoiceSide, howManyChoiceDip, howManyChoiceDrink, howManyChoiceBeverage, food_menu_id, food_menu_name, food_menu_price, food_menu_cal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        category_id,
        name,
        image,
        price,
        cal,
        description || "",
        howManyFlavor,
        howManyChoiceFlavor,
        howManyChoiceSide || 0,
        howManyChoiceDip || 0,
        howManyChoiceDrink || 0,
        howManyChoiceBeverage || 0,
        food_menu_id,
        food_menu_name || "",
        food_menu_price || 0,
        food_menu_cal || "",
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Food Details, please try again",
      });
    }

    const food_details_id = result.insertId;

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

// Get All FoodDetails
exports.getAllFoodDetails = async (req, res) => {
  try {
    // Retrieve food details from the main table
    const [foodDetails] = await db.query("SELECT * FROM food_details");

    // If no data found, send an empty response
    if (foodDetails.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No food details found",
        data: [],
      });
    }

    // Iterate over each food detail and retrieve related data (dip, side, drink, beverage)
    for (const foodDetail of foodDetails) {
      const food_details_id = foodDetail.id;

      // Retrieve dips for this food
      const [dips] = await db.query(
        `SELECT
          dff.id AS dip_food_id,
          dff.dip_id,
          dff.isPaid,
          d.name AS dip_name,
          d.image AS dip_image,
          d.cal AS dip_cal,
          d.price AS dip_price
        FROM dip_for_food dff
        LEFT JOIN dip d ON dff.dip_id = d.id
        WHERE dff.food_details_id = ?`,
        [food_details_id]
      );

      // Retrieve sides for this food
      const [sides] = await db.query(
        `SELECT
          sff.id AS side_food_id,
          sff.side_id,
          sff.isPaid,
          s.name AS side_name,
          s.image AS side_image,
          s.cal AS side_cal,
          s.price AS side_price
        FROM side_for_food sff
        LEFT JOIN side s ON sff.side_id = s.id
        WHERE sff.food_details_id = ?`,
        [food_details_id]
      );

      // Retrieve drinks for this food
      const [drinks] = await db.query(
        `SELECT
          dff.id AS drink_food_id,
          dff.drink_id,
          dff.isPaid,
          dr.name AS drink_name,
          dr.image AS drink_image,
          dr.cal AS drink_cal,
          dr.price AS drink_price
        FROM drink_for_food dff
        LEFT JOIN drink dr ON dff.drink_id = dr.id
        WHERE dff.food_details_id = ?`,
        [food_details_id]
      );

      // Retrieve beverages for this food
      const [beverages] = await db.query(
        `SELECT
          bff.id AS beverage_food_id,
          bff.beverage_id,
          bff.isPaid,
          br.name AS beverage_name,
          br.image AS beverage_image,
          br.cal AS beverage_cal,
          br.price AS beverage_price
        FROM beverage_for_food bff
        LEFT JOIN beverage br ON bff.beverage_id = br.id
        WHERE bff.food_details_id = ?`,
        [food_details_id]
      );

      // Attach related data to the main food detail object
      foodDetail.dips = dips;
      foodDetail.sides = sides;
      foodDetail.drinks = drinks;
      foodDetail.beverages = beverages;
    }

    // Send success response with all food details
    res.status(200).send({
      success: true,
      message: "Food details retrieved successfully",
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

    // Retrieve dips for this food
    const [dips] = await db.query(
      `SELECT
          dff.id AS dip_food_id,
          dff.dip_id,
          dff.isPaid,
          d.name AS dip_name,
          d.image AS dip_image,
          d.cal AS dip_cal,
          d.price AS dip_price
        FROM dip_for_food dff
        LEFT JOIN dip d ON dff.dip_id = d.id
        WHERE dff.food_details_id = ?`,
      [id]
    );

    // Retrieve sides for this food
    const [sides] = await db.query(
      `SELECT
          sff.id AS side_food_id,
          sff.side_id,
          sff.isPaid,
          s.name AS side_name,
          s.image AS side_image,
          s.cal AS side_cal,
          s.price AS side_price
        FROM side_for_food sff
        LEFT JOIN side s ON sff.side_id = s.id
        WHERE sff.food_details_id = ?`,
      [id]
    );

    // Retrieve drinks for this food
    const [drinks] = await db.query(
      `SELECT
          dff.id AS drink_food_id,
          dff.drink_id,
          dff.isPaid,
          dr.name AS drink_name,
          dr.image AS drink_image,
          dr.cal AS drink_cal,
          dr.price AS drink_price
        FROM drink_for_food dff
        LEFT JOIN drink dr ON dff.drink_id = dr.id
        WHERE dff.food_details_id = ?`,
      [id]
    );

    // Retrieve beverages for this food
    const [beverages] = await db.query(
      `SELECT
          bff.id AS beverage_food_id,
          bff.beverage_id,
          bff.isPaid,
          br.name AS beverage_name,
          br.image AS beverage_image,
          br.cal AS beverage_cal,
          br.price AS beverage_price
        FROM beverage_for_food bff
        LEFT JOIN beverage br ON bff.beverage_id = br.id
        WHERE bff.food_details_id = ?`,
      [id]
    );

    const foodInfo = {
      ...foodDetails[0],
      dips: dips,
      sides: sides,
      drinks: drinks,
      beverages: beverages,
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

// update FoodMenu
exports.updateFoodMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const { category_id, name, details, sn_number } = req.body;

    const [foodMenuPreData] = await db.query(
      `SELECT * FROM food_menu WHERE id=?`,
      [id]
    );

    if (!foodMenuPreData || foodMenuPreData.length == 0) {
      return res.status(404).send({
        success: false,
        message: "Food Menu not found",
      });
    }

    const images = req.file;
    let image = foodMenuPreData[0].image;
    if (images && images.path) {
      image = `/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE food_menu SET category_id=?, name=?, image=?, details=?, sn_number=? WHERE id = ?",
      [
        category_id || foodMenuPreData[0].category_id,
        name || foodMenuPreData[0].name,
        image,
        details || foodMenuPreData[0].details,
        sn_number || foodMenuPreData[0].sn_number,
        id,
      ]
    );

    // Check if the Food Menu was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "Food Menu not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Food Menu updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Food Menu",
      error: error.message,
    });
  }
};

// delete FoodMenu
exports.deleteFoodMenu = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).send({
        success: false,
        message: "foodMenu ID is required",
      });
    }

    // Check if the foodMenu exists in the database
    const [foodMenu] = await db.query(`SELECT * FROM food_menu WHERE id = ?`, [
      id,
    ]);

    // If foodMenu not found, return 404
    if (!foodMenu || foodMenu.length === 0) {
      return res.status(404).send({
        success: false,
        message: "food_menu not found",
      });
    }

    // Proceed to delete the food_menu
    const [result] = await db.query(`DELETE FROM food_menu WHERE id = ?`, [id]);

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
