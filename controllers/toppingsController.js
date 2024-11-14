const db = require("../config/db");

// create Toppings
exports.createToppings = async (req, res) => {
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

    // Insert Toppings into the database
    const [result] = await db.query(
      "INSERT INTO toppings (name, image, cal, price, size) VALUES (?, ?, ?, ?, ?)",
      [name, image, cal, price, size || ""]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Toppings, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Toppings inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Toppings",
      error: error.message,
    });
  }
};

// get all Toppings
exports.getAllToppings = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM toppings");

    res.status(200).send({
      success: true,
      message: "Get all Toppings",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Toppings",
      error: error.message,
    });
  }
};

// get singe Toppings
exports.getSingleToppings = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM toppings WHERE id=? ", [id]);

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Toppings not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single Toppings",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single Toppings",
      error: error.message,
    });
  }
};

// update Toppings
exports.updateToppings = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, cal, price, size } = req.body;

    const [toppingsPreData] = await db.query(
      `SELECT * FROM toppings WHERE id=?`,
      [id]
    );

    if (!toppingsPreData || toppingsPreData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Toppings not found",
      });
    }

    const images = req.file;
    let image = toppingsPreData[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE toppings SET name=?, image=?, cal = ?, price = ?, size=? WHERE id = ?",
      [
        name || toppingsPreData[0].name,
        image,
        cal || toppingsPreData[0].cal,
        price || toppingsPreData[0].price,
        size || toppingsPreData[0].size,
        id,
      ]
    );

    // Check if the Toppings was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Toppings not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Toppings updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Toppings",
      error: error.message,
    });
  }
};

// delete Toppings
exports.deleteToppings = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the Toppings exists in the database
    const [data] = await db.query(`SELECT * FROM toppings WHERE id = ?`, [id]);

    // If Toppings not found, return 404
    if (!data || data.length === 0) {
      return res.status(201).send({
        success: false,
        message: "Toppings not found",
      });
    }

    // Proceed to delete the Toppings
    const [result] = await db.query(`DELETE FROM toppings WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete Toppings",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Toppings deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting Toppings",
      error: error.message,
    });
  }
};
