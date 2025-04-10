const db = require("../config/db");

// create drink name
exports.createDrinkName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please provide name field",
      });
    }

    const images = req.file;
    let image = "";
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Insert drink_name into the database
    const [result] = await db.query(
      "INSERT INTO drink_name (name, image) VALUES (?, ?)",
      [name, image]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Drink name, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Drink name inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Drink name",
      error: error.message,
    });
  }
};

// get all DrinksName
exports.getAllDrinksName = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM drink_name");

    res.status(200).send({
      success: true,
      message: "Get all Drink Name",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Drink Name",
      error: error.message,
    });
  }
};

// get singe Drink Name
exports.getSingleDrinkName = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM drink_name WHERE id=? ", [id]);

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Drink Name not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single Drink Name",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single Drink Name",
      error: error.message,
    });
  }
};

// update Drink Name
exports.updateDrinkName = async (req, res) => {
  try {
    const { id } = req.params;

    const { name } = req.body;

    const [preData] = await db.query(`SELECT * FROM drink_name WHERE id=?`, [
      id,
    ]);

    if (!preData || preData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Drink Name not found",
      });
    }

    const images = req.file;
    let image = preData[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE drink_name SET name=?, image=? WHERE id = ?",
      [name || preData[0].name, image, id]
    );

    // Check if the Drink Name was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Drink Name not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Drink Name updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Drink Name",
      error: error.message,
    });
  }
};

// delete DrinkName
exports.deleteDrinkName = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the DrinkName exists in the database
    const [drink_name] = await db.query(
      `SELECT * FROM drink_name WHERE id = ?`,
      [id]
    );

    // If drink_name not found, return 404
    if (!drink_name || drink_name.length === 0) {
      return res.status(201).send({
        success: false,
        message: "drink name not found",
      });
    }

    // Proceed to delete the drink name
    const [result] = await db.query(`DELETE FROM drink_name WHERE id = ?`, [
      id,
    ]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete drink name",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "drink name deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting drink name",
      error: error.message,
    });
  }
};
