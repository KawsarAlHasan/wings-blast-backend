const db = require("../config/db");
const { sendBulkEmails } = require("../middleware/sendBulkEmails");
const { sendBulkPromotionEmails } = require("../middleware/sendBulkEmails");

// `offers`(`id`, `type`, `code`, `food_id`, `name`, `image`, `carry_out_use_time`, `delivery_use_time`, `discount_percentage`, `discount_amount`, `date`, `start_date`
// , `end_date`, `is_date`, `is_duration_date`, `is_discount_percentage`, `is_discount_amount`, `is_active`)

// `user_offers`(`id`, `type_id`, `user_id`, `sent_time`, `delivery_used_time`, `carry_out_used_time`, `sent_at`, `used_at`

// create offers
exports.createOffers = async (req, res) => {
  try {
    const {
      type,
      code,
      food_id,
      name,
      image,
      carry_out_use_time,
      delivery_use_time,
      discount_percentage,
      discount_amount,
      date,
      start_date,
      end_date,
      is_date,
      is_duration_date,
      is_discount_percentage,
      is_discount_amount,
    } = req.body;

    if (!type || !code) {
      return res.status(400).send({
        success: false,
        message: "Please provide type & code field",
      });
    }

    const [result] = await db.query(
      "INSERT INTO offers ( type, code, food_id, name, image, carry_out_use_time, delivery_use_time, discount_percentage, discount_amount, date, start_date, end_date, is_date, is_duration_date, is_discount_percentage, is_discount_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        type,
        code,
        food_id || 0,
        name || "",
        image || "",
        carry_out_use_time || 0,
        delivery_use_time || 0,
        discount_percentage || 0,
        discount_amount || 0,
        date || 0,
        start_date || 0,
        end_date || 0,
        is_date || 0,
        is_duration_date || 0,
        is_discount_percentage || 0,
        is_discount_amount || 0,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Offer, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Offer inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// get all Offers
exports.getAllOffers = async (req, res) => {
  try {
    const { type } = req.query;

    const [data] = await db.query("SELECT * FROM offers WHERE type=?", [type]);

    if (!data || data.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Offer not found",
      });
    }

    for (const singleData of data) {
      const offerID = singleData.id;
      const [used_time] = await db.query(
        "SELECT SUM(carry_out_used_time + delivery_used_time) AS total_used_time FROM user_offers WHERE type_id =?",
        [offerID]
      );

      singleData.used_time = used_time[0].total_used_time;
    }

    res.status(200).send({
      success: true,
      message: "Get All Offers",
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Offers",
      error: error.message,
    });
  }
};

// get single Offer
exports.getSingleOffer = async (req, res) => {
  try {
    const id = req.params.id;

    // const [data] = await db.query("SELECT * FROM offers WHERE id =?", [id]);

    const [data] = await db.query(
      `SELECT 
        ofr.*,
        fd.name AS food_details_name, 
        fd.image AS food_details_image
        FROM offers ofr
        LEFT JOIN food_details fd ON ofr.food_id = fd.id
        WHERE ofr.id=? `,
      [id]
    );

    if (!data || data.length == 0) {
      return res.status(400).send({
        success: true,
        message: "No offers found",
      });
    }

    const [used_time] = await db.query(
      "SELECT SUM(carry_out_used_time + delivery_used_time) AS total_used_time FROM user_offers WHERE type_id =?",
      [id]
    );

    res.status(200).send({
      success: true,
      message: "Get Single Offer",
      data: {
        ...data[0],
        used_time: used_time[0].total_used_time,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get single Offer",
      error: error.message,
    });
  }
};

// send offer to user
exports.sendOfferUser = async (req, res) => {
  try {
    const { user_ids, type_id, type } = req.body;

    const currentTime = new Date();

    const [existingUsers] = await db.query(
      `SELECT user_id, sent_time FROM user_offers WHERE type_id = ? AND type =? AND user_id IN (?)`,
      [type_id, type, user_ids]
    );

    // const [users] = await db.query(
    //   `SELECT id, first_name, last_name, email FROM users WHERE id IN (?)`,
    //   [user_ids]
    // );

    const existingUserIds = existingUsers.map((user) => user.user_id);
    const newUserIds = user_ids.filter((id) => !existingUserIds.includes(id));

    if (existingUsers.length > 0) {
      await Promise.all(
        existingUsers.map((user) =>
          db.query(
            `UPDATE user_offers SET sent_time = ?, sent_at = ? WHERE user_id = ? AND type_id = ? AND type =?`,
            [user.sent_time + 1, currentTime, user.user_id, type_id, type]
          )
        )
      );
    }

    if (newUserIds.length > 0) {
      const values = newUserIds.map((id) => [
        id,
        type_id,
        1,
        currentTime,
        type,
      ]);
      await db.query(
        `INSERT INTO user_offers (user_id, type_id, sent_time, sent_at, type) VALUES ?`,
        [values]
      );
    }

    // const offer = {
    // id: type_id,
    // name: offer_name,
    // discount_percentage: offer_discount_percentage,
    // code: offer_code,
    // discount_price: offer_discount_price,
    // expiration_date: offer_expiration_date,
    // image: offer_image,
    // is_discount_percentage: offer_is_discount_percentage,
    //   };

    //   const emailSent = await sendBulkEmails(users, offer);

    //   if (!emailSent) {
    //     return res.status(500).json({
    //       message: "Error sending emails",
    //     });
    //   }

    res.status(200).json({
      message: "Offer sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending Offer",
      error: error.message,
    });
  }
};

// check offer code
exports.getMyDiscountsOffers = async (req, res) => {
  try {
    const { code, user_id, delivery_type, food_ids } = req.body;

    if (!code || !user_id) {
      return res.status(400).send({
        success: false,
        message: "Please provide code and user_id field",
      });
    }

    const [offers] = await db.query(`SELECT * FROM offers WHERE code = ?`, [
      code,
    ]);
    const offer = offers[0];

    if (!offer) {
      return res.status(404).send({
        success: false,
        message: "Offer not found with this code",
      });
    }

    const [userOffers] = await db.query(
      `SELECT * FROM user_offers WHERE user_id = ? AND type_id = ?`,
      [user_id, offer.id]
    );

    if (userOffers.length === 0) {
      return res.status(400).send({
        success: false,
        message: "This not your offer",
      });
    }

    // // check active or deactive
    if (offer.is_active != 1) {
      return res.status(400).send({
        success: false,
        message: "This offer is not active",
      });
    }

    // // check is_duration_date
    // const today = new Date();
    // if (offer.is_duration_date == 1) {
    //   const startDate = new Date(offer.start_date);
    //   const endDate = new Date(offer.end_date);

    //   if (today < startDate || today > endDate) {
    //     return res.status(400).send({
    //       success: false,
    //       message: "This offer is not valid today",
    //     });
    //   }
    // }

    if (delivery_type === "carryout") {
      const carry_out_used_time = userOffers[0]?.carry_out_used_time;
      const carry_out_use_time = offer?.carry_out_use_time;

      if (carry_out_used_time >= carry_out_use_time) {
        return res.status(400).send({
          success: false,
          message: "You have already used this offer",
        });
      }
    }

    if (delivery_type === "delivery") {
      const delivery_used_time = userOffers[0]?.delivery_used_time;
      const delivery_use_time = offer?.delivery_use_time;

      if (delivery_used_time >= delivery_use_time) {
        return res.status(400).send({
          success: false,
          message: "You have already used this offer",
        });
      }
    }

    if (offer?.type == "promotion") {
      const food_id = offer?.food_id;
      const matchedFood = food_ids.find((item) => item.food_id === food_id);

      if (matchedFood) {
        let promotionOfer = offer;

        if (offer.is_discount_percentage == 1) {
          const [foodData] = await db.query(
            `SELECT id, price, name FROM food_details WHERE id = ?`,
            [food_id]
          );

          const discountPercentage = offer.discount_percentage;
          const foodPrice = foodData[0]?.price;
          const foodQuentity = matchedFood?.quentity;

          const totalPrice = foodPrice * foodQuentity;
          const discountAmount = (totalPrice * discountPercentage) / 100;

          const sendPromotionOffer = {
            id: offer.id,
            type: offer.type,
            code: offer.code,
            food_id: offer.food_id,
            food_details_name: foodData[0]?.name,
            name: offer.name,
            image: offer.image,
            carry_out_use_time: offer.carry_out_use_time,
            delivery_use_time: offer.delivery_use_time,
            discount_percentage: 0,
            discount_amount: discountAmount,
            date: offer.date,
            start_date: offer.start_date,
            end_date: offer.end_date,
            is_date: offer.is_date,
            is_duration_date: offer.is_duration_date,
            is_discount_percentage: 0,
            is_discount_amount: 1,
            is_active: offer.is_active,
          };

          promotionOfer = sendPromotionOffer;
        }

        return res.status(200).send({
          success: true,
          message: "Single Food Promotion",
          data: promotionOfer,
        });
      } else {
        return res.status(404).send({
          success: false,
          message: "There is no promotion food here.",
        });
      }
    }

    res.status(200).send({
      success: true,
      message: "All Food Offer",
      data: offer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// get all user for offer
exports.getAllUsers = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT id, first_name, last_name, email, phone FROM users`
    );

    res.status(200).send({
      success: true,
      message: "Get All Users",
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// get Offers Send User
exports.getOffersSendUser = async (req, res) => {
  try {
    const { user_id, offer_id, used_time } = req.query;

    let query = `
      SELECT
        up.*,
        u.id AS user_id,
        u.first_name AS first_name,
        u.last_name AS last_name,
        u.email AS email,
        u.phone AS phone
      FROM user_offers up
      LEFT JOIN users u ON up.user_id = u.id
    `;

    let conditions = [];
    let queryParams = [];

    if (user_id) {
      conditions.push("user_id = ?");
      queryParams.push(user_id);
    }

    if (offer_id) {
      conditions.push("type_id = ?");
      queryParams.push(offer_id);
    }

    if (used_time) {
      conditions.push("(carry_out_used_time + delivery_used_time) = ?");
      queryParams.push(Number(used_time));
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    // Execute the query
    const [data] = await db.query(query, queryParams);

    res.status(200).send({
      success: true,
      message: "Get Offer Send Users",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internel Server Error",
      error: error.message,
    });
  }
};

// update Offers
exports.updateOffers = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      code,
      food_id,
      name,
      image,
      carry_out_use_time,
      delivery_use_time,
      discount_percentage,
      discount_amount,
      date,
      start_date,
      end_date,
      is_date,
      is_duration_date,
      is_discount_percentage,
      is_discount_amount,
    } = req.body;

    // Check if Offers exists
    const [existingOffers] = await db.query(
      "SELECT * FROM offers WHERE id = ?",
      [id]
    );

    if (!existingOffers || existingOffers.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Offers not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE offers SET code=?, food_id=?, name=?, carry_out_use_time=?, delivery_use_time=?, discount_percentage=?, discount_amount=?, date=?, start_date=?, end_date=?, is_date=?, is_duration_date=?, is_discount_percentage=?, is_discount_amount=? WHERE id = ?",
      [
        code || existingOffers[0].code,
        food_id || existingOffers[0].food_id,
        name || existingOffers[0].name,
        carry_out_use_time || existingOffers[0].carry_out_use_time,
        delivery_use_time || existingOffers[0].delivery_use_time,
        discount_percentage || existingOffers[0].discount_percentage,
        discount_amount || existingOffers[0].discount_amount,
        date || existingOffers[0].date,
        start_date || existingOffers[0].start_date,
        end_date || existingOffers[0].end_date,
        is_date || existingOffers[0].is_date,
        is_duration_date || existingOffers[0].is_duration_date,
        is_discount_percentage || existingOffers[0].is_discount_percentage,
        is_discount_amount || existingOffers[0].is_discount_amount,
        id,
      ]
    );

    // Check if the Offer was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "Offer not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Offer updated successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).send({
      success: false,
      message: "Error updating Offer",
      error: error.message,
    });
  }
};

// delete Offer
exports.deleteOffers = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the offers exists in the database
    const [offers] = await db.query(`SELECT * FROM offers WHERE id = ?`, [id]);

    // If offers not found, return 404
    if (offers.length === 0) {
      return res.status(404).send({
        success: false,
        message: "offers not found",
      });
    }

    await db.query(`DELETE FROM user_offers WHERE type_id = ?`, [id]);
    const [result] = await db.query(`DELETE FROM offers WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete offers",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "offers deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting offers",
      error: error.message,
    });
  }
};
