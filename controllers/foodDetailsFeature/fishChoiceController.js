const db = require("../../config/db");

// create fish choice
exports.createFishChoice = async (req, res) => {
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

    // Insert fish_choice into the database
    const [result] = await db.query(
      "INSERT INTO fish_choice (name, image, cal, price) VALUES (?, ?, ?, ?)",
      [name, image, cal, price]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Fish, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Fish inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Fish",
      error: error.message,
    });
  }
};

// get all fish choice
exports.getAllFishChoice = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM fish_choice");

    res.status(200).send({
      success: true,
      message: "Get all fish choice",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All fish choice",
      error: error.message,
    });
  }
};

// get singe fish choice
exports.getSingleFishChoice = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM fish_choice WHERE id=? ", [
      id,
    ]);

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "fish choice not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single fish choice",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single fish choice",
      error: error.message,
    });
  }
};

// update fish choice
exports.updateFishChoice = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, cal, price } = req.body;

    const [fishPreData] = await db.query(
      `SELECT * FROM fish_choice WHERE id=?`,
      [id]
    );

    if (!fishPreData || fishPreData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "fish choice not found",
      });
    }

    const images = req.file;
    let image = fishPreData[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE fish_choice SET name=?, image=?, cal = ?, price = ? WHERE id = ?",
      [
        name || fishPreData[0].name,
        image,
        cal || fishPreData[0].cal,
        price || fishPreData[0].price,
        id,
      ]
    );

    // Check if the fish_choice was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "fish choice not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "fish choice updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating fish choice",
      error: error.message,
    });
  }
};

// delete fish choice
exports.deleteFishChoice = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the fish_choice exists in the database
    const [fish_choice] = await db.query(
      `SELECT * FROM fish_choice WHERE id = ?`,
      [id]
    );

    // If fish_choice not found, return 404
    if (!fish_choice || fish_choice.length === 0) {
      return res.status(201).send({
        success: false,
        message: "fish choice not found",
      });
    }

    // Proceed to delete the fish choice
    const [result] = await db.query(`DELETE FROM fish_choice WHERE id = ?`, [
      id,
    ]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete fish choice",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "fish choice deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting fish choice",
      error: error.message,
    });
  }
};
