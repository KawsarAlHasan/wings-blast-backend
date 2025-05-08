const db = require("../config/db");

// add to card
exports.addToCard = async (req, res) => {
  try {
    const { guest_user_id, food_details_id, price, quantity, features } =
      req.body;

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

    const [data] = await db.query(
      `SELECT * FROM card WHERE guest_user_id=? AND food_details_id=?`,
      [guest_user_id, food_details_id]
    );

    if (data.length > 0) {
      for (const singleData of data) {
        const card_id = singleData.id;
        await db.query(`DELETE FROM card_addons WHERE card_id=?`, [card_id]);
      }

      await db.query(
        `DELETE FROM card WHERE guest_user_id=? AND food_details_id=?`,
        [guest_user_id, food_details_id]
      );
    }

    // Insert card into the database
    const [result] = await db.query(
      "INSERT INTO card (guest_user_id, food_details_id, price, quantity) VALUES (?, ?, ?, ?)",
      [guest_user_id, food_details_id, price, quantity]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Card, please try again",
      });
    }

    const card_id = result.insertId;

    if (Array.isArray(features) && features.length > 0) {
      const featureQueary =
        "INSERT INTO card_addons (card_id, type, type_id, is_paid_type, quantity, child_item_id) VALUES ?";

      const featureValues = features.map((fetur) => [
        card_id,
        fetur.type,
        fetur.type_id,
        fetur?.is_paid_type,
        fetur?.quantity,
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
        fd.buy_one_get_one_id,
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

    for (const singleFood of cardForGuest) {
      const buyOneGetOneID = singleFood.buy_one_get_one_id;
      let buy_one_get_one = {};

      if (buyOneGetOneID > 0) {
        const [foodDetailsGetOnBuyOn] = await db.query(
          "SELECT id, name, price, image, cal, description FROM food_details WHERE id =?",
          [buyOneGetOneID]
        );
        buy_one_get_one = foodDetailsGetOnBuyOn[0];
      }
      singleFood.buy_one_get_one = buy_one_get_one;
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

      const [flavors] = await db.query(
        `SELECT
            c_addon.type_id AS flavor_id,
            c_addon.quantity,
            flvr.name AS flavor_name
          FROM card_addons c_addon
          LEFT JOIN flavor flvr ON c_addon.type_id = flvr.id
          WHERE c_addon.card_id = ? AND c_addon.type = ?`,
        [card_id, "flavor"]
      );

      cdForUsr.flavors = flavors;

      // Common addons
      cdForUsr.dips = await getAddons(card_id, "dip", "dip");
      cdForUsr.sides = await getAddons(card_id, "side", "side");
      cdForUsr.bakery = await getAddons(card_id, "bakery", "beverage");
      cdForUsr.topping = await getAddons(card_id, "topping", "toppings");
      cdForUsr.sauce = await getAddons(card_id, "sauce", "sauce");
      cdForUsr.ricePlatter = await getAddons(card_id, "ricePlatter", "side");
      cdForUsr.sandwich = await getAddons(
        card_id,
        "sandwich",
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
