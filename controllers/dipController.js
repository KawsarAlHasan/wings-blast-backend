const db = require("../config/db");

// create Dip
exports.createDip = async (req, res) => {
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

    // Insert dip into the database
    const [result] = await db.query(
      "INSERT INTO dip (name, image, cal, price) VALUES (?, ?, ?, ?)",
      [name, image, cal, price]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert dip, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "dip inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the dip",
      error: error.message,
    });
  }
};

// get all Dip
exports.getAllDip = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM dip");

    res.status(200).send({
      success: true,
      message: "Get all dip",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All dip",
      error: error.message,
    });
  }
};

// get singe Dip
exports.getSingleDip = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM dip WHERE id=? ", [id]);

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "dip not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single dip",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single dip",
      error: error.message,
    });
  }
};

// update Dip
exports.updateDip = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, cal, price } = req.body;

    const [dipPreData] = await db.query(`SELECT * FROM dip WHERE id=?`, [id]);

    if (!dipPreData || dipPreData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "dip not found",
      });
    }

    const images = req.file;
    let image = dipPreData[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE dip SET name=?, image=?, cal = ?, price = ? WHERE id = ?",
      [
        name || dipPreData[0].name,
        image,
        cal || dipPreData[0].cal,
        price || dipPreData[0].price,
        id,
      ]
    );

    // Check if the Dip was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Dip not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Dip updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Dip",
      error: error.message,
    });
  }
};

// delete Dip
exports.deleteDip = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the dip exists in the database
    const [dip] = await db.query(`SELECT * FROM dip WHERE id = ?`, [id]);

    // If dip not found, return 404
    if (!dip || dip.length === 0) {
      return res.status(201).send({
        success: false,
        message: "dip not found",
      });
    }

    // Proceed to delete the dip
    const [result] = await db.query(`DELETE FROM dip WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete dip",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "dip deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting dip",
      error: error.message,
    });
  }
};
