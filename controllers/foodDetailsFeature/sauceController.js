const db = require("../../config/db");

// create Sauce
exports.createSauce = async (req, res) => {
  try {
    const { name, cal, price, size } = req.body;

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

    // Insert sauce into the database
    const [result] = await db.query(
      "INSERT INTO sauce (name, image, cal, price, size) VALUES (?, ?, ?, ?, ?)",
      [name, image, cal, price, size || ""]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert sauce, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Sauce inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the sauce",
      error: error.message,
    });
  }
};

// get all sauce
exports.getAllSauce = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM sauce");

    res.status(200).send({
      success: true,
      message: "Get all sauce",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All sauce",
      error: error.message,
    });
  }
};

// get singe sauce
exports.getSingleSauce = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM sauce WHERE id=? ", [id]);

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Sauce not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single sauce",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single sauce",
      error: error.message,
    });
  }
};

// update sauce
exports.updateSauce = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, cal, price, size } = req.body;

    const [saucePreData] = await db.query(`SELECT * FROM sauce WHERE id=?`, [
      id,
    ]);

    if (!saucePreData || saucePreData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Sauce not found",
      });
    }

    const images = req.file;
    let image = saucePreData[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE sauce SET name=?, image=?, cal = ?, price = ?, size=? WHERE id = ?",
      [
        name || saucePreData[0].name,
        image,
        cal || saucePreData[0].cal,
        price || saucePreData[0].price,
        size || saucePreData[0].size,
        id,
      ]
    );

    // Check if the sauce was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Sauce not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Sauce updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating sauce",
      error: error.message,
    });
  }
};

// delete sauce
exports.deleteSauce = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the sauce exists in the database
    const [data] = await db.query(`SELECT * FROM sauce WHERE id = ?`, [id]);

    // If sauce not found, return 404
    if (!data || data.length === 0) {
      return res.status(201).send({
        success: false,
        message: "Sauce not found",
      });
    }

    // Proceed to delete the sauce
    const [result] = await db.query(`DELETE FROM sauce WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete sauce",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Sauce deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting sauce",
      error: error.message,
    });
  }
};
