const db = require("../../config/db");

// create Banner
exports.createBanner = async (req, res) => {
  try {
    const { title, link_url, type, sn_number, status } = req.body;

    const video_image = req.file;
    let videoImage = "";

    if (video_image && video_image.path) {
      videoImage = `https://api.wingsblast.com/public/files/${video_image.filename}`;
    }

    // Insert banner into the database
    const [result] = await db.query(
      "INSERT INTO banner (title, video_image, type, link_url, sn_number, status) VALUES (?, ?, ?, ?, ?, ?)",
      [
        title || "",
        videoImage,
        type || "",
        link_url || "",
        sn_number || 100,
        status || "Active",
      ]
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
      "SELECT * FROM banner WHERE status=? ORDER BY sn_number ASC ",
      ["Active"]
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

    const { title, link_url, type, sn_number, status } = req.body;

    const [bannerPreData] = await db.query(`SELECT * FROM banner WHERE id=?`, [
      id,
    ]);

    if (!bannerPreData || bannerPreData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "banner not found",
      });
    }

    const video_image = req.file;
    let videoImage = bannerPreData[0].video_image;
    if (video_image && video_image.path) {
      videoImage = `https://api.wingsblast.com/public/files/${video_image.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE banner SET title=?, video_image=?, type=?, link_url = ?, sn_number = ?, status = ? WHERE id = ?",
      [
        title || bannerPreData[0].title,
        videoImage,
        type || bannerPreData[0].type,
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

// status update Banner
exports.statusUpdateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    const [bannerPreData] = await db.query(`SELECT * FROM banner WHERE id=?`, [
      id,
    ]);

    if (!bannerPreData || bannerPreData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "banner not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE banner SET status = ? WHERE id = ?",
      [status || bannerPreData[0].status, id]
    );

    // Success response
    res.status(200).send({
      success: true,
      message: "Banner status updated successfully",
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
