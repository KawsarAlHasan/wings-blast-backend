const db = require("../config/db");

// create Feature
exports.createFeature = async (req, res) => {
  try {
    const { name, settings } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please provide name field",
      });
    }

    // Insert Feature into the database
    const [result] = await db.query(
      "INSERT INTO feature (name, settings) VALUES (?, ?)",
      [name, settings || ""]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Feature, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Feature inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Feature",
      error: error.message,
    });
  }
};

// get all Feature
exports.getAllFeature = async (req, res) => {
  try {
    const [featureName] = await db.query("SELECT * FROM feature");

    if (!featureName || featureName.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Feature not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get all Feature",
      data: featureName,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Feature",
      error: error.message,
    });
  }
};

// get singe Feature
exports.getSingleFeature = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM feature WHERE id=? ", [id]);

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Feature not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single Feature",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single Feature",
      error: error.message,
    });
  }
};

// update Feature
exports.updateFeature = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, settings } = req.body;

    const [preData] = await db.query(`SELECT * FROM feature WHERE id=?`, [id]);

    if (!preData || preData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Feature not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE feature SET name=?, settings=? WHERE id = ?",
      [name || preData[0].name, settings || preData[0].settings, id]
    );

    // Check if the Feature was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Feature not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Feature updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Feature",
      error: error.message,
    });
  }
};

// delete Feature
exports.deleteFeature = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the Feature exists in the database
    const [data] = await db.query(`SELECT * FROM feature WHERE id = ?`, [id]);

    // If Feature not found, return 404
    if (!data || data.length === 0) {
      return res.status(201).send({
        success: false,
        message: "Feature not found",
      });
    }

    // Proceed to delete the Feature
    const [result] = await db.query(`DELETE FROM feature WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete Feature",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Feature deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting Feature",
      error: error.message,
    });
  }
};
