const db = require("../config/db");

// get Delivery Fee
exports.getDeliveryFee = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM delivery_fee");

    res.status(200).send({
      success: true,
      message: "Get Delivery Fee",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Delivery Fee",
      error: error.message,
    });
  }
};

// update Delivery Fee
exports.updateDeliveryFee = async (req, res) => {
  try {
    const { id } = req.params;

    const { region, fee } = req.body;

    const [deliveryFeePreData] = await db.query(
      `SELECT * FROM delivery_fee WHERE id=?`,
      [id]
    );

    // Execute the update query
    const [result] = await db.query(
      "UPDATE delivery_fee SET region = ?, fee=? WHERE id = ?",
      [
        region || deliveryFeePreData[0].region,
        fee || deliveryFeePreData[0].fee,
        id,
      ]
    );

    // Check if the Delivery Fee was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Delivery Fee not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Delivery Fee updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Delivery Fee",
      error: error.message,
    });
  }
};

// get Tax
exports.getTax = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM tax");

    res.status(200).send({
      success: true,
      message: "Get Tax",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Tax",
      error: error.message,
    });
  }
};

// update Tax
exports.updateTax = async (req, res) => {
  try {
    const { id } = req.params;

    const { tax_name, tax_rate, region } = req.body;

    const [preData] = await db.query(`SELECT * FROM tax WHERE id=?`, [id]);

    // Execute the update query
    const [result] = await db.query(
      "UPDATE tax SET tax_name = ?, tax_rate=?, region=? WHERE id = ?",
      [
        tax_name || preData[0].tax_name,
        tax_rate || preData[0].tax_rate,
        region || preData[0].region,
        id,
      ]
    );

    // Check if the Tax was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Tax not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Tax updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Tax",
      error: error.message,
    });
  }
};

// get footer_settings
exports.getFooterSettings = async (req, res) => {
  try {
    const type = req.params.type;

    const [data] = await db.query(
      "SELECT * FROM footer_settings WHERE type =?",
      [type]
    );

    res.status(200).send({
      success: true,
      message: `Get ${type}`,
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// update footer_settings
exports.updateFooterSettings = async (req, res) => {
  try {
    const type = req.params.type;

    const { content } = req.body;

    const [preData] = await db.query(
      `SELECT * FROM footer_settings WHERE type=?`,
      [type]
    );

    // Execute the update query
    const [result] = await db.query(
      "UPDATE footer_settings SET content=? WHERE type = ?",
      [content || preData[0].content, type]
    );

    // Check if the footer_settings was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: `${type} not found or no changes made`,
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: `${type} updated successfully`,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// create Banner
exports.createBanner = async (req, res) => {
  try {
    const { title, link_url, sn_number, status } = req.body;

    const images = req.file;
    let image = "";
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Insert banner into the database
    const [result] = await db.query(
      "INSERT INTO banner (title, image, link_url, sn_number, status) VALUES (?, ?, ?, ?, ?)",
      [title || "", image, link_url || "", sn_number || 100, status || "Active"]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert banner, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "banner inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the banner",
      error: error.message,
    });
  }
};

// get all banner
exports.getAllBanner = async (req, res) => {
  try {
    const [data] = await db.query(
      "SELECT * FROM banner ORDER BY sn_number ASC"
    );

    res.status(200).send({
      success: true,
      message: "Get all banner",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All banner",
      error: error.message,
    });
  }
};

// update Banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, link_url, sn_number, status } = req.body;

    const [bannerPreData] = await db.query(`SELECT * FROM banner WHERE id=?`, [
      id,
    ]);

    if (!bannerPreData || bannerPreData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "banner not found",
      });
    }

    const images = req.file;
    let image = bannerPreData[0].image;
    if (images && images.path) {
      image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE banner SET title=?, image=?, link_url = ?, sn_number = ?, status = ? WHERE id = ?",
      [
        title || bannerPreData[0].title,
        image,
        link_url || bannerPreData[0].link_url,
        sn_number || bannerPreData[0].sn_number,
        status || bannerPreData[0].status,
        id,
      ]
    );

    // Check if the Banner was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Banner not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Banner updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Banner",
      error: error.message,
    });
  }
};

// delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the Banner exists in the database
    const [banner] = await db.query(`SELECT * FROM banner WHERE id = ?`, [id]);

    // If banner not found, return 404
    if (!banner || banner.length === 0) {
      return res.status(201).send({
        success: false,
        message: "banner not found",
      });
    }

    // Proceed to delete the banner
    const [result] = await db.query(`DELETE FROM banner WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete banner",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "banner deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting banner",
      error: error.message,
    });
  }
};
