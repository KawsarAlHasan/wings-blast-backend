const db = require("../../config/db");
const { generateGuestUserToken } = require("../../config/guestUserToken");

// create GuestUser
exports.createGuestUser = async (req, res) => {
  try {
    const [result] = await db.query("INSERT INTO guest_user (id) VALUES (?)", [
      "",
    ]);

    const id = result.insertId;

    const guestUserToken = generateGuestUserToken({ id });

    // Send success response
    res.status(200).send({
      success: true,
      message: "Successfully Create Guest User",
      guestUserToken,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Guest User",
      error: error.message,
    });
  }
};

// get Guest User
exports.getGuestUser = async (req, res) => {
  try {
    const id = req.decodedGuestId;

    const [data] = await db.query("SELECT * FROM guest_user WHERE id=?", [id]);

    res.status(200).json({
      success: true,
      guestUserId: data[0].id,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
