const db = require("../config/db");

// create Product Feature
exports.createProductFeature = async (req, res) => {
  try {
    const { feature_id, name, cal, price, size } = req.body;

    if (!feature_id || !name || !cal || !price) {
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

    // Insert Product Feature into the database
    const [result] = await db.query(
      "INSERT INTO product_feature (feature_id, name, image, cal, price, size) VALUES (?, ?, ?, ?, ?, ?)",
      [feature_id, name, image, cal, price, size || ""]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Product Feature, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Product Feature inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Product Feature",
      error: error.message,
    });
  }
};

// get all Product Feature
exports.getAllProductFeature = async (req, res) => {
  try {
    const feature_id = req.params.id;

    const [featureName] = await db.query("SELECT * FROM feature WHERE id =?", [
      feature_id,
    ]);

    const [data] = await db.query(
      "SELECT * FROM product_feature WHERE feature_id =?",
      [feature_id]
    );

    res.status(200).send({
      success: true,
      message: "Get all Product Feature",
      featureName: featureName[0],
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Product Feature",
      error: error.message,
    });
  }
};

// get singe Product Feature
exports.getSingleProductFeature = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM product_feature WHERE id=? ", [
      id,
    ]);

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Product Feature not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single Product Feature",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single Product Feature",
      error: error.message,
    });
  }
};

// update Product Feature
exports.updateProductFeature = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, cal, price, size } = req.body;

    const [preData] = await db.query(
      `SELECT * FROM product_feature WHERE id=?`,
      [id]
    );

    if (!preData || preData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Product Feature not found",
      });
    }

    const images = req.file;
    let image = preData[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE product_feature SET name=?, image=?, cal = ?, price = ?, size=? WHERE id = ?",
      [
        name || preData[0].name,
        image,
        cal || preData[0].cal,
        price || preData[0].price,
        size || preData[0].size,
        id,
      ]
    );

    // Check if the Product Feature was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Product Feature not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Product Feature updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Product Feature",
      error: error.message,
    });
  }
};

// delete Product Feature
exports.deleteProductFeature = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the Product Feature exists in the database
    const [data] = await db.query(
      `SELECT * FROM product_feature WHERE id = ?`,
      [id]
    );

    // If Product Feature not found, return 404
    if (!data || data.length === 0) {
      return res.status(201).send({
        success: false,
        message: "Product Feature not found",
      });
    }

    // Proceed to delete the Product Feature
    const [result] = await db.query(
      `DELETE FROM product_feature WHERE id = ?`,
      [id]
    );

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete Product Feature",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Product Feature deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting Product Feature",
      error: error.message,
    });
  }
};
