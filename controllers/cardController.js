const db = require("../config/db");

// add card
exports.addCard = async (req, res) => {
  try {
    const {
      user_id,
      guest_user_id,
      food_details_id,
      price,
      quantity,
      dip_id,
      is_dip_paid,
      side_id,
      is_side_paid,
      drink_id,
      is_drink_paid,
      bakery_id,
      is_bakery_paid,
      flavers,
    } = req.body;

    if (!food_details_id || !price || !quantity) {
      return res.status(400).send({
        success: false,
        message: "Please provide food_details_id, quantity & price field",
      });
    }

    if (!user_id && !guest_user_id) {
      return res.status(400).send({
        success: false,
        message: "Please provide user_id or guest_user_id field",
      });
    }

    // Insert card into the database
    const [result] = await db.query(
      "INSERT INTO card (user_id, guest_user_id, food_details_id, price, quantity, dip_id, is_dip_paid, side_id, is_side_paid, drink_id, is_drink_paid, bakery_id, is_bakery_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user_id || 0,
        guest_user_id || 0,
        food_details_id,
        price,
        quantity,
        dip_id || 0,
        is_dip_paid || 0,
        side_id || 0,
        is_side_paid || 0,
        drink_id || 0,
        is_drink_paid || 0,
        bakery_id || 0,
        is_bakery_paid || 0,
      ]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Card, please try again",
      });
    }

    const card_id = result.insertId;

    if (Array.isArray(flavers) && flavers.length > 0) {
      const flavorQuery =
        "INSERT INTO flavers_for_card (card_id, flavor_id, quantity	) VALUES ?";
      const flavorValues = flavers.map((flavor) => [
        card_id,
        flavor.id,
        flavor.quantity,
      ]);
      await db.query(flavorQuery, [flavorValues]);
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Card inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Card",
      error: error.message,
    });
  }
};

// get My Card
exports.getMyCard = async (req, res) => {
  try {
    const { user_id, guest_user_id } = req.query;

    if (!user_id && !guest_user_id) {
      return res.status(400).send({
        success: false,
        message: "Please provide user_id or guest_user_id field",
      });
    }

    if (user_id) {
      const [cardForUser] = await db.query(
        `SELECT
          crd.*,
          fd.name AS food_name,
          fd.price AS food_price,
          fd.image AS food_image,
          dp.name AS dip_name,
          dp.price AS dip_price,
          dp.image AS dip_image,
          sd.name AS side_name,
          sd.price AS side_price,
          sd.image AS side_image,
          drk.name AS drink_name,
          drk.price AS drink_price,
          drk.image AS drink_image,
          bvr.name AS bakery_name,
          bvr.price AS bakery_price,
          bvr.image AS bakery_image
        FROM card crd
        LEFT JOIN food_details fd ON crd.food_details_id = fd.id
        LEFT JOIN dip dp ON crd.dip_id = dp.id
        LEFT JOIN side sd ON crd.side_id = sd.id
        LEFT JOIN drink drk ON crd.drink_id = drk.id
        LEFT JOIN beverage bvr ON crd.bakery_id = bvr.id
        WHERE crd.user_id = ?`,
        [user_id]
      );

      if (cardForUser.length === 0) {
        return res.status(201).send({
          success: false,
          message: "No Product found in cart",
        });
      }

      for (const cdForUsr of cardForUser) {
        const card_id = cdForUsr.id;

        // Retrieve flavors for this food
        const [flavors] = await db.query(
          `SELECT
            fcard.id,
            fcard.quantity,
            fvr.id AS flavor_id,
            fvr.name AS flavor_name,
            fvr.image AS flavor_image,
            fvr.flavor_rating
          FROM flavers_for_card fcard
          LEFT JOIN flavor fvr ON fcard.flavor_id = fvr.id
          WHERE fcard.card_id = ?`,
          [card_id]
        );

        cdForUsr.flavors = flavors;
      }

      res.status(200).send({
        success: true,
        message: "Foods retrieved from cart",
        data: cardForUser,
      });
    } else if (guest_user_id) {
      const [cardForGuest] = await db.query(
        `SELECT
        crd.*,
        fd.name AS food_name,
        fd.price AS food_price,
        fd.image AS food_image,
        fd.description AS food_description,
        dp.name AS dip_name,
        dp.price AS dip_price,
        dp.image AS dip_image,
        dp.isPaid AS dip_isPaid,
        sd.name AS side_name,
        sd.price AS side_price,
        sd.image AS side_image,
        sd.isPaid AS side_isPaid,
        drk.name AS drink_name,
        drk.price AS drink_price,
        drk.image AS drink_image,
        drk.isPaid AS drink_isPaid,
        bvr.name AS bakery_name,
        bvr.price AS bakery_price,
        bvr.image AS bakery_image,
        bvr.isPaid AS bakery_isPaid
      FROM card crd
      LEFT JOIN food_details fd ON crd.food_details_id = fd.id
      LEFT JOIN dip dp ON crd.dip_id = dp.id
      LEFT JOIN side sd ON crd.side_id = sd.id
      LEFT JOIN drink drk ON crd.drink_id = drk.id
      LEFT JOIN beverage bvr ON crd.bakery_id = bvr.id
      WHERE crd.guest_user_id = ?`,
        [guest_user_id]
      );

      if (cardForGuest.length === 0) {
        return res.status(201).send({
          success: false,
          message: "No Product found in cart",
        });
      }

      res.status(200).send({
        success: true,
        message: "Foods retrieved from cart",
        data: cardForGuest,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error retrieving Foods from cart",
      error: error.message,
    });
  }
};

// delete All Food from cart
exports.deleteAllFoodFromCart = async (req, res) => {
  try {
    const { user_id, guest_user_id } = req.query;

    if (!user_id && !guest_user_id) {
      return res.status(400).send({
        success: false,
        message: "Please provide user_id or guest_user_id field",
      });
    }

    if (user_id) {
      const [data] = await db.query(`SELECT * FROM cart WHERE user_id=? `, [
        user_id,
      ]);
      if (!data || data.length === 0) {
        return res.status(201).send({
          success: false,
          message: "No Product found from cart",
        });
      }
      await db.query(`DELETE FROM card WHERE user_id=?`, [user_id]);
      res.status(200).send({
        success: true,
        message: "Delete all product from cart",
      });
    } else if (guest_user_id) {
      const [data] = await db.query(
        `SELECT * FROM cart WHERE guest_user_id=? `,
        [guest_user_id]
      );
      if (!data || data.length === 0) {
        return res.status(201).send({
          success: false,
          message: "No Product found from cart",
        });
      }
      await db.query(`DELETE FROM cart WHERE guest_user_id=?`, [guest_user_id]);
      res.status(200).send({
        success: true,
        message: "Delete all product from cart",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in delete all product from cart",
      error: error.message,
    });
  }
};

// delete Single Food from cart
exports.deleteSingleFoodFromCart = async (req, res) => {
  try {
    const id = req.params.id;

    const [data] = await db.query(`SELECT * FROM card WHERE id=? `, [id]);
    if (!data || data.length === 0) {
      return res.status(201).send({
        success: false,
        message: "No Food found from card",
      });
    }

    await db.query(`DELETE FROM flavers_for_card WHERE card_id=?`, [id]);

    await db.query(`DELETE FROM card WHERE id=?`, [id]);
    res.status(200).send({
      success: true,
      message: "Delete Single Food from card",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in delete Single Food from card",
      error: error.message,
    });
  }
};
