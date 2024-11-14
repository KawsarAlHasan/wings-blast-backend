const db = require("../config/db");

// create flavor
exports.createFlavor = async (req, res) => {
  try {
    const {
      name,
      description,
      flavor_rating,
      sn_number,
      isNew,
      ispopular,
      isLimitedTime,
      isWet,
      isDry,
      isHoney,
    } = req.body;

    // Check if flavor_name is provided
    if (
      !name ||
      !description ||
      !flavor_rating ||
      !isWet ||
      !isDry ||
      !isHoney
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Please provide name, description, flavor_rating, isWet, isDry & isHoney field",
      });
    }

    const images = req.file;
    let image = "";
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Insert flavor into the database
    const [result] = await db.query(
      "INSERT INTO flavor (name, image, description, flavor_rating, sn_number, isNew, ispopular, isLimitedTime, isWet, isDry, isHoney) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        image,
        description,
        flavor_rating,
        sn_number || 100,
        isNew || 0,
        ispopular || 0,
        isLimitedTime || 0,
        isWet,
        isDry,
        isHoney,
      ]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert flavor, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Flavor inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Flavor",
      error: error.message,
    });
  }
};

// get all flavor
exports.getAllFlavor = async (req, res) => {
  try {
    const [data] = await db.query(
      "SELECT * FROM flavor ORDER BY sn_number ASC"
    );

    res.status(200).send({
      success: true,
      message: "Get all Flavor",
      totalFlavor: data.length,
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Flavor",
      error: error.message,
    });
  }
};

// get singe flavor
exports.getSingleFlavor = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query(
      "SELECT * FROM flavor WHERE id=? ORDER BY sn_number ASC",
      [id]
    );

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "flavor not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single Flavor",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single Flavor",
      error: error.message,
    });
  }
};

// update flavor
exports.updateflavor = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      flavor_rating,
      sn_number,
      isNew,
      ispopular,
      isLimitedTime,
      isWet,
      isDry,
    } = req.body;

    const [flavorPreData] = await db.query(`SELECT * FROM flavor WHERE id=?`, [
      id,
    ]);

    if (!flavorPreData || flavorPreData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "flavor not found",
      });
    }

    const images = req.file;
    let image = flavorPreData[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE flavor SET name=?, image=?, description = ?, flavor_rating = ?, sn_number =?, isNew =?, ispopular=?, isLimitedTime =?, isWet=?, isDry=? WHERE id = ?",
      [
        name,
        image,
        description,
        flavor_rating,
        sn_number,
        isNew,
        ispopular,
        isLimitedTime,
        isWet,
        isDry,
        id,
      ]
    );

    // Check if the Flavor was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Flavor not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Flavor updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Flavor",
      error: error.message,
    });
  }
};

// delete Flavor
exports.deleteflavor = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the flavor exists in the database
    const [flavor] = await db.query(`SELECT * FROM flavor WHERE id = ?`, [id]);

    // If flavor not found, return 404
    if (!flavor || flavor.length === 0) {
      return res.status(201).send({
        success: false,
        message: "flavor not found",
      });
    }

    // Proceed to delete the flavor
    const [result] = await db.query(`DELETE FROM flavor WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete flavor",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "flavor deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting flavor",
      error: error.message,
    });
  }
};
