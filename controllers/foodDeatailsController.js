const db = require("../config/db");

// create food Details
exports.createFoodDetails = async (req, res) => {
  try {
    const {
      category_id,
      food_menu_id,
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

    // Insert Menu Food into the database
    const [result] = await db.query(
      "INSERT INTO food_details (category_id, food_menu_id, name, image, price, cal, description, howManyFlavor, howManyChoiceFlavor, howManyChoiceSide, howManyChoiceDip, howManyChoiceDrink, howManyChoiceBeverage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        category_id,
        food_menu_id,
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
      ]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Food Details, please try again",
      });
    }

    const food_details_id = result.insertId;

    // dip
    const dipQuery =
      "INSERT INTO dip_for_food (food_details_id, dip_id, isPaid) VALUES ?";
    const dipValues = dips.map((dip) => [
      food_details_id,
      dip.dip_id,
      dip.isPaid,
    ]);
    await db.query(dipQuery, [dipValues]);

    // side
    const sideQuery =
      "INSERT INTO side_for_food (food_details_id, side_id, isPaid) VALUES ?";
    const sideValues = sides.map((side) => [
      food_details_id,
      side.side_id,
      side.isPaid,
    ]);
    await db.query(sideQuery, [sideValues]);

    // drink
    const drinkQuery =
      "INSERT INTO drink_for_food (food_details_id, drink_id, isPaid) VALUES ?";
    const drinkValues = drinks.map((drink) => [
      food_details_id,
      drink.drink_id,
      drink.isPaid,
    ]);
    await db.query(drinkQuery, [drinkValues]);

    // side
    const beverageQuery =
      "INSERT INTO beverage_for_food (food_details_id, beverage_id, isPaid) VALUES ?";
    const beverageValues = beverages.map((beverage) => [
      food_details_id,
      beverage.beverage_id,
      beverage.isPaid,
    ]);
    await db.query(beverageQuery, [beverageValues]);

    // Send success response
    res.status(200).send({
      success: true,
      message: "Food Details inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Food Details",
      error: error.message,
    });
  }
};

// get all FoodMenu
exports.getAllFoodMenu = async (req, res) => {
  try {
    const [data] = await db.query(
      "SELECT * FROM food_menu ORDER BY sn_number ASC"
    );
    if (!data || data.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No Food menu found",
        result: data,
      });
    }

    res.status(200).send({
      success: true,
      message: "Get all Food menu",
      totalFoodMenu: data.length,
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Food menu",
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
