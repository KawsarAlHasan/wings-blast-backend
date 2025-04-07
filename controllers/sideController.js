const db = require("../config/db");

// create Side
exports.createSide = async (req, res) => {
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

    // Insert Side into the database
    const [result] = await db.query(
      "INSERT INTO side (name, image, cal, price, size) VALUES (?, ?, ?, ?, ?)",
      [name, image, cal, price, size || ""]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Side, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Side inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Side",
      error: error.message,
    });
  }
};

// get all Side
exports.getAllSide = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM side");

    res.status(200).send({
      success: true,
      message: "Get all Side",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Side",
      error: error.message,
    });
  }
};

// get singe Side
exports.getSingleSide = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM side WHERE id=? ", [id]);

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Side not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single Side",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single Side",
      error: error.message,
    });
  }
};

// update Side
exports.updateSide = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, cal, price, size } = req.body;

    const [sidePreData] = await db.query(`SELECT * FROM side WHERE id=?`, [id]);

    if (!sidePreData || sidePreData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "side not found",
      });
    }

    const images = req.file;
    let image = sidePreData[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE side SET name=?, image=?, cal = ?, price = ?, size=? WHERE id = ?",
      [
        name || sidePreData[0].name,
        image,
        cal || sidePreData[0].cal,
        price || sidePreData[0].price,
        size || sidePreData[0].size,
        id,
      ]
    );

    // Check if the Side was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Side not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Side updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Side",
      error: error.message,
    });
  }
};

// delete Side
exports.deleteSide = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the Side exists in the database
    const [side] = await db.query(`SELECT * FROM side WHERE id = ?`, [id]);

    // If side not found, return 404
    if (!side || side.length === 0) {
      return res.status(201).send({
        success: false,
        message: "side not found",
      });
    }

    // Proceed to delete the side
    const [result] = await db.query(`DELETE FROM side WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete side",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "side deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting side",
      error: error.message,
    });
  }
};
