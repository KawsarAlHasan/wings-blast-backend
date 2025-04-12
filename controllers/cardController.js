const db = require("../config/db");

// add card
exports.addCard = async (req, res) => {
  try {
    const {
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
      toppings,
      sandCust,
    } = req.body;

    if (!food_details_id || !price || !quantity) {
      return res.status(400).send({
        success: false,
        message: "Please provide food_details_id, quantity & price field",
      });
    }

    if (!guest_user_id) {
      return res.status(400).send({
        success: false,
        message: "Please provide guest_user_id field",
      });
    }

    // Insert card into the database
    const [result] = await db.query(
      "INSERT INTO card (guest_user_id, food_details_id, price, quantity, dip_id, is_dip_paid, side_id, is_side_paid, drink_id, is_drink_paid, bakery_id, is_bakery_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
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

    if (Array.isArray(toppings) && toppings.length > 0) {
      const toppingsQuery =
        "INSERT INTO toppings_for_card (card_id, toppings_id, isPaid	) VALUES ?";
      const toppingValues = toppings.map((topping) => [
        card_id,
        topping.id,
        topping.isPaid,
      ]);
      await db.query(toppingsQuery, [toppingValues]);
    }

    if (Array.isArray(sandCust) && sandCust.length > 0) {
      const sandCustQuery =
        "INSERT INTO sandCust_for_card (card_id, sand_cust_id, isPaid	) VALUES ?";
      const sandCustValues = sandCust.map((sndCt) => [
        card_id,
        sndCt.id,
        sndCt.isPaid,
      ]);
      await db.query(sandCustQuery, [sandCustValues]);
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
    const { guest_user_id } = req.query;

    if (!guest_user_id) {
      return res.status(400).send({
        success: false,
        message: "Please provide guest_user_id field",
      });
    }

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
      WHERE crd.guest_user_id = ?`,
      [guest_user_id]
    );

    if (cardForGuest.length === 0) {
      return res.status(201).send({
        success: false,
        message: "No Product found in card",
      });
    }

    for (const cdForUsr of cardForGuest) {
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

      // Retrieve toppings for this food
      const [toppings] = await db.query(
        `SELECT
            tfc.id,
            tfc.isPaid,
            top.id AS toppings_id,
            top.name AS toppings_name,
            top.image AS toppings_image,
            top.cal,
            top.price
          FROM toppings_for_card tfc
          LEFT JOIN toppings top ON tfc.toppings_id = top.id
          WHERE tfc.card_id = ?`,
        [card_id]
      );

      // Retrieve sandCust for this food
      const [sandCust] = await db.query(
        `SELECT
            sfc.id,
            sfc.isPaid,
            san.id AS sandCust_id,
            san.name AS sandCust_name,
            san.image AS sandCust_image,
            san.cal,
            san.price,
            san.size
          FROM sandCust_for_card sfc
          LEFT JOIN sandwich_customize san ON sfc.sand_cust_id = san.id
          WHERE sfc.card_id = ?`,
        [card_id]
      );

      cdForUsr.flavors = flavors;
      cdForUsr.toppings = toppings;
      cdForUsr.sandCust = sandCust;
    }

    res.status(200).send({
      success: true,
      message: "Foods retrieved from card",
      data: cardForGuest,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error retrieving Foods from card",
      error: error.message,
    });
  }
};

// new version
// add to card
exports.addToCard = async (req, res) => {
  try {
    const {
      guest_user_id,
      food_details_id,
      price,
      quantity,
      flavers,
      features,
    } = req.body;

    if (!food_details_id || !price || !quantity) {
      return res.status(400).send({
        success: false,
        message: "Please provide food_details_id, quantity & price field",
      });
    }

    if (!guest_user_id) {
      return res.status(400).send({
        success: false,
        message: "Please provide guest_user_id field",
      });
    }

    // Insert card into the database
    const [result] = await db.query(
      "INSERT INTO card (guest_user_id, food_details_id, price, quantity) VALUES (?, ?, ?, ?)",
      [guest_user_id || 0, food_details_id, price, quantity]
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

    if (Array.isArray(features) && features.length > 0) {
      const featureQueary =
        "INSERT INTO card_addons (card_id, type, type_id, is_paid_type, quantity, child_item_id) VALUES ?";

      const featureValues = features.map((fetur) => [
        card_id,
        fetur.type,
        fetur.type_id,
        fetur.is_paid_type,
        fetur.quantity,
        fetur?.child_item_id,
      ]);

      await db.query(featureQueary, [featureValues]);
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
exports.getMyCards = async (req, res) => {
  try {
    const { guest_user_id } = req.query;

    if (!guest_user_id) {
      return res.status(400).send({
        success: false,
        message: "Please provide guest_user_id field",
      });
    }

    const [cardForGuest] = await db.query(
      `SELECT
        crd.id,
        crd.guest_user_id,
        crd.food_details_id,
        crd.price,
        crd.quantity,
        fd.name AS food_name,
        fd.price AS food_price,
        fd.image AS food_image,
        fd.description AS food_description
      FROM card crd
      LEFT JOIN food_details fd ON crd.food_details_id = fd.id
      WHERE crd.guest_user_id = ?`,
      [guest_user_id]
    );

    if (cardForGuest.length === 0) {
      return res.status(201).send({
        success: false,
        message: "No Product found in card",
      });
    }

    async function getAddons(card_id, type, tableName) {
      const [results] = await db.query(
        `SELECT
            c_addon.is_paid_type,
            c_addon.quantity,
            t.name,
            t.price
          FROM card_addons c_addon
          LEFT JOIN ${tableName} t ON c_addon.type_id = t.id
          WHERE c_addon.card_id = ? AND c_addon.type = ?`,
        [card_id, type]
      );
      return results;
    }

    for (const cdForUsr of cardForGuest) {
      const card_id = cdForUsr.id;

      // Common addons
      cdForUsr.dips = await getAddons(card_id, "Dip", "dip");
      cdForUsr.sides = await getAddons(card_id, "Side", "side");
      cdForUsr.bakery = await getAddons(card_id, "Bakery", "beverage");
      cdForUsr.topping = await getAddons(card_id, "Topping", "toppings");
      cdForUsr.sandwich = await getAddons(
        card_id,
        "Sandwich",
        "sandwich_customize"
      );

      const [drinkList] = await db.query(
        `SELECT
            c_addon.is_paid_type,
            c_addon.quantity,
            c_addon.child_item_id,
            t.name AS size_name,
            t.price,
            d_name.name AS brand_name
          FROM card_addons c_addon
          LEFT JOIN drink t ON c_addon.type_id = t.id
          LEFT JOIN drink_name d_name ON c_addon.child_item_id = d_name.id
          WHERE c_addon.card_id = ? AND c_addon.type = ?`,
        [card_id, "drink"]
      );

      cdForUsr.drinks = drinkList;

      // Retrieve flavors for this food
      const [flavors] = await db.query(
        `SELECT
            fcard.id,
            fcard.quantity,
            fvr.id AS flavor_id,
            fvr.name AS flavor_name,
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
      message: "Foods retrieved from card",
      data: cardForGuest,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error retrieving Foods from card",
      error: error.message,
    });
  }
};

// delete All Food from card
exports.deleteAllFoodFromCard = async (req, res) => {
  try {
    const guest_user_id = req.params.id;

    if (!guest_user_id) {
      return res.status(400).send({
        success: false,
        message: "Please provide guest_user_id field",
      });
    }

    const [data] = await db.query(`SELECT * FROM card WHERE guest_user_id=? `, [
      guest_user_id,
    ]);
    if (!data || data.length === 0) {
      return res.status(201).send({
        success: false,
        message: "No Product found from card",
      });
    }

    for (const singleData of data) {
      const card_id = singleData.id;
      await db.query(`DELETE FROM card_addons WHERE card_id=?`, [card_id]);
      await db.query(`DELETE FROM flavers_for_card WHERE card_id=?`, [card_id]);
      await db.query(`DELETE FROM toppings_for_card WHERE card_id=?`, [
        card_id,
      ]);
      await db.query(`DELETE FROM sandCust_for_card WHERE card_id=?`, [
        card_id,
      ]);
    }

    await db.query(`DELETE FROM card WHERE guest_user_id=?`, [guest_user_id]);
    res.status(200).send({
      success: true,
      message: "Delete all product from card",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in delete all product from card",
      error: error.message,
    });
  }
};

// delete Single Food from card
exports.deleteSingleFoodFromCard = async (req, res) => {
  try {
    const id = req.params.id;

    const [data] = await db.query(`SELECT * FROM card WHERE id=? `, [id]);
    if (!data || data.length === 0) {
      return res.status(201).send({
        success: false,
        message: "No Food found from card",
      });
    }

    await db.query(`DELETE FROM card_addons WHERE card_id=?`, [id]);
    await db.query(`DELETE FROM flavers_for_card WHERE card_id=?`, [id]);
    await db.query(`DELETE FROM toppings_for_card WHERE card_id=?`, [id]);
    await db.query(`DELETE FROM sandCust_for_card WHERE card_id=?`, [id]);

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
