const db = require("../config/db");

// create Menu food
exports.createMenuFood = async (req, res) => {
  try {
    const { category_id, name, details, sn_number } = req.body;

    // Check if name is provided
    if (!category_id || !name) {
      return res.status(400).send({
        success: false,
        message: "Please provide category_id & name field",
      });
    }

    const images = req.file;
    let image = "";
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Insert Menu Food into the database
    const [result] = await db.query(
      "INSERT INTO food_menu (category_id, name, image, details, sn_number) VALUES (?, ?, ?, ?, ?)",
      [category_id, name, image, details || "", sn_number || 100]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Menu Food, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Menu Food inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Menu Food",
      error: error.message,
    });
  }
};

// get all FoodMenu
exports.getAllFoodMenu = async (req, res) => {
  try {
    const [foodMenus] = await db.query(`SELECT * FROM food_menu`);
    if (!foodMenus || foodMenus.length === 0) {
      return res.status(201).send({
        success: true,
        message: "No Food menu found",
        data: [],
      });
    }

    for (const menu of foodMenus) {
      const [details] = await db.query(
        `SELECT * FROM food_details WHERE food_menu_id = ?`,
        [menu.id]
      );
      menu.food_details = details;
    }

    res.status(200).send({
      success: true,
      message: "Get all Food menu with details",
      totalFoodMenu: foodMenus.length,
      data: foodMenus,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Food menu",
      error: error.message,
    });
  }
};

// single food menu
exports.getSingleFoodMenu = async (req, res) => {
  try {
    const id = req.params.id;
    const [foodMenus] = await db.query(`SELECT * FROM food_menu WHERE id=?`, [
      id,
    ]);
    if (!foodMenus || foodMenus.length === 0) {
      return res.status(201).send({
        success: false,
        message: "No Food menu found",
        data: [],
      });
    }

    res.status(200).send({
      success: true,
      message: "Get single Food menu",
      data: foodMenus,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get single Food menu",
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
      return res.status(201).send({
        success: false,
        message: "Food Menu not found",
      });
    }

    const images = req.file;
    let image = foodMenuPreData[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
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
      return res.status(201).send({
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
      return res.status(201).send({
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
