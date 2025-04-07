const db = require("../config/db");

// create Beverage
exports.createBeverage = async (req, res) => {
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

    // Insert Beverage into the database
    const [result] = await db.query(
      "INSERT INTO beverage (name, image, cal, price) VALUES (?, ?, ?, ?)",
      [name, image, cal, price]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Beverage, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Beverage inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Beverage",
      error: error.message,
    });
  }
};

// get all Beverage
exports.getAllBeverage = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM beverage");

    res.status(200).send({
      success: true,
      message: "Get all Beverage",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Beverage",
      error: error.message,
    });
  }
};

// get singe Beverage
exports.getSingleBeverage = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM beverage WHERE id=? ", [id]);

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Beverage not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single Beverage",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single Beverage",
      error: error.message,
    });
  }
};

// update Beverage
exports.updateBeverage = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, cal, price } = req.body;

    const [beveragePreData] = await db.query(
      `SELECT * FROM beverage WHERE id=?`,
      [id]
    );

    if (!beveragePreData || beveragePreData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "beverage not found",
      });
    }

    const images = req.file;
    let image = beveragePreData[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE beverage SET name=?, image=?, cal = ?, price = ? WHERE id = ?",
      [
        name || beveragePreData[0].name,
        image,
        cal || beveragePreData[0].cal,
        price || beveragePreData[0].price,
        id,
      ]
    );

    // Check if the beverage was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "beverage not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "beverage updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating beverage",
      error: error.message,
    });
  }
};

// delete beverage
exports.deletebeverage = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the beverage exists in the database
    const [beverage] = await db.query(`SELECT * FROM beverage WHERE id = ?`, [
      id,
    ]);

    // If beverage not found, return 404
    if (!beverage || beverage.length === 0) {
      return res.status(201).send({
        success: false,
        message: "beverage not found",
      });
    }

    // Proceed to delete the beverage
    const [result] = await db.query(`DELETE FROM beverage WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete beverage",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "beverage deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting beverage",
      error: error.message,
    });
  }
};
