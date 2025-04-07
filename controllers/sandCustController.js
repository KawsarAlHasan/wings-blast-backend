const db = require("../config/db");

// create Sandwich customize
exports.createSandCust = async (req, res) => {
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

    // Insert Sandwich customize into the database
    const [result] = await db.query(
      "INSERT INTO sandwich_customize (name, image, cal, price, size) VALUES (?, ?, ?, ?, ?)",
      [name, image, cal, price, size || ""]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Sandwich customize, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Sandwich customize inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Sandwich customize",
      error: error.message,
    });
  }
};

// get all Sandwich Customize
exports.getAllSandCust = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM sandwich_customize");

    res.status(200).send({
      success: true,
      message: "Get all Sandwich Customize",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Sandwich Customize",
      error: error.message,
    });
  }
};

// get singe Sandwich Customize
exports.getSingleSandCust = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query(
      "SELECT * FROM sandwich_customize WHERE id=? ",
      [id]
    );

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Sandwich Customize not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single Sandwich Customize",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single Sandwich Customize",
      error: error.message,
    });
  }
};

// update Sandwich Customize
exports.updateSandCust = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, cal, price, size } = req.body;

    const [sandCustPreData] = await db.query(
      `SELECT * FROM sandwich_customize WHERE id=?`,
      [id]
    );

    if (!sandCustPreData || sandCustPreData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Sandwich Customize not found",
      });
    }

    const images = req.file;
    let image = sandCustPreData[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE sandwich_customize SET name=?, image=?, cal = ?, price = ?, size=? WHERE id = ?",
      [
        name || sandCustPreData[0].name,
        image,
        cal || sandCustPreData[0].cal,
        price || sandCustPreData[0].price,
        size || sandCustPreData[0].size,
        id,
      ]
    );

    // Check if the Sandwich Customize was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Sandwich Customize not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Sandwich Customize updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Sandwich Customize",
      error: error.message,
    });
  }
};

// delete Sandwich Customize
exports.deleteSandCust = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the Sandwich Customize exists in the database
    const [data] = await db.query(
      `SELECT * FROM sandwich_customize WHERE id = ?`,
      [id]
    );

    // If Sandwich Customize not found, return 404
    if (!data || data.length === 0) {
      return res.status(201).send({
        success: false,
        message: "Sandwich Customize not found",
      });
    }

    // Proceed to delete the Sandwich Customize
    const [result] = await db.query(
      `DELETE FROM sandwich_customize WHERE id = ?`,
      [id]
    );

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete Sandwich Customize",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Sandwich Customize deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting Sandwich Customize",
      error: error.message,
    });
  }
};
