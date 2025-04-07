const db = require("../config/db");

// create Drink
exports.createDrink = async (req, res) => {
  try {
    const { name, cal, price } = req.body;

    if (!name || !cal || !price) {
      return res.status(400).send({
        success: false,
        message: "Please provide name, cal & price field",
      });
    }

    const images = req.file;
    let image = "";
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Insert Drink into the database
    const [result] = await db.query(
      "INSERT INTO drink (name, image, cal, price) VALUES (?, ?, ?, ?)",
      [name, image, cal, price]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert drink, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "drink inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the drink",
      error: error.message,
    });
  }
};

// get all drink
exports.getAllDrink = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM drink");

    res.status(200).send({
      success: true,
      message: "Get all drink",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All drink",
      error: error.message,
    });
  }
};

// get singe drink
exports.getSingleDrink = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM drink WHERE id=? ", [id]);

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "drink not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single drink",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single drink",
      error: error.message,
    });
  }
};

// update drink
exports.updateDrink = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, cal, price } = req.body;

    const [drinkPreData] = await db.query(`SELECT * FROM drink WHERE id=?`, [
      id,
    ]);

    if (!drinkPreData || drinkPreData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "drink not found",
      });
    }

    const images = req.file;
    let image = drinkPreData[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE drink SET name=?, image=?, cal = ?, price = ? WHERE id = ?",
      [
        name || drinkPreData[0].name,
        image,
        cal || drinkPreData[0].cal,
        price || drinkPreData[0].price,
        id,
      ]
    );

    // Check if the drink was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "drink not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "drink updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating drink",
      error: error.message,
    });
  }
};

// delete drink
exports.deleteDrink = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the drink exists in the database
    const [drink] = await db.query(`SELECT * FROM drink WHERE id = ?`, [id]);

    // If drink not found, return 404
    if (!drink || drink.length === 0) {
      return res.status(201).send({
        success: false,
        message: "drink not found",
      });
    }

    // Proceed to delete the drink
    const [result] = await db.query(`DELETE FROM drink WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete drink",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "drink deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting drink",
      error: error.message,
    });
  }
};
