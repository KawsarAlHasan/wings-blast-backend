const db = require("../config/db");

// create category
exports.createCategory = async (req, res) => {
  try {
    const { sn_number, category_name } = req.body;

    // Check if category_name is provided
    if (!category_name) {
      return res.status(400).send({
        success: false,
        message: "Please provide category_name field",
      });
    }

    const images = req.file;
    let category_image = "";
    if (images && images.path) {
      category_image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Insert category into the database
    const [result] = await db.query(
      "INSERT INTO categories (sn_number, category_name, category_image) VALUES (?, ?, ?)",
      [sn_number || 100, category_name, category_image]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert category, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Category inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the category",
      error: error.message,
    });
  }
};

// get all category
exports.getAllCategory = async (req, res) => {
  try {
    const [data] = await db.query(
      "SELECT * FROM categories ORDER BY sn_number ASC"
    );
    if (!data || data.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No Categories found",
        result: data,
      });
    }

    res.status(200).send({
      success: true,
      message: "Get all Categories",
      totalCategories: data.length,
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Categories",
      error: error.message,
    });
  }
};

// get all category With Food
exports.getAllCategoryWithFood = async (req, res) => {
  try {
    const [categoriesData] = await db.query(
      "SELECT * FROM categories ORDER BY sn_number ASC"
    );

    if (!categoriesData || categoriesData.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No categories found",
        totalCategories: 0,
        data: [],
      });
    }

    for (const category of categoriesData) {
      const category_id = category.id;

      const [foodMenus] = await db.query(
        `SELECT * FROM food_menu WHERE category_id=?`,
        [category_id]
      );

      category.food_menus = foodMenus || [];

      for (const menu of category.food_menus) {
        const [details] = await db.query(
          `SELECT * FROM food_details WHERE food_menu_id = ?`,
          [menu.id]
        );

        menu.food_details = details || [];
      }
    }

    res.status(200).send({
      success: true,
      message: "Get all Categories",
      totalCategories: categoriesData.length,
      data: categoriesData,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Categories",
      error: error.message,
    });
  }
};

// get all category With Food for user
exports.getAllCategoryWithFoodForUser = async (req, res) => {
  try {
    const [categoriesData] = await db.query(
      "SELECT * FROM categories ORDER BY sn_number ASC"
    );

    if (!categoriesData || categoriesData.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No categories found",
        totalCategories: 0,
        data: [],
      });
    }

    for (const category of categoriesData) {
      const category_id = category.id;

      const [foodMenus] = await db.query(
        `SELECT * FROM food_menu WHERE category_id=?`,
        [category_id]
      );

      category.food_menus = foodMenus || [];

      for (const menu of category.food_menus) {
        const [details] = await db.query(
          `SELECT * FROM food_details WHERE status = 'active' AND food_menu_id = ?`,
          [menu.id]
        );

        menu.food_details = details || [];
      }
    }

    res.status(200).send({
      success: true,
      message: "Get all Categories",
      totalCategories: categoriesData.length,
      data: categoriesData,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Categories",
      error: error.message,
    });
  }
};

// update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { sn_number, category_name } = req.body;

    const [categoryPreData] = await db.query(
      `SELECT * FROM categories WHERE id=?`,
      [id]
    );

    if (!categoryPreData || categoryPreData.length == 0) {
      return res.status(201).send({
        success: false,
        message: "Category not found",
      });
    }

    const images = req.file;
    let category_image = categoryPreData[0].category_image;
    if (images && images.path) {
      category_image = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE categories SET sn_number=?, category_name = ?, category_image = ? WHERE id = ?",
      [
        sn_number || categoryPreData[0].sn_number,
        category_name || categoryPreData[0].category_name,
        category_image,
        id,
      ]
    );

    // Check if the category was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Category not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Category",
      error: error.message,
    });
  }
};

// delete category
exports.deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Category ID is required",
      });
    }

    // Check if the category exists in the database
    const [category] = await db.query(`SELECT * FROM categories WHERE id = ?`, [
      id,
    ]);

    // If category not found, return 404
    if (!category || category.length === 0) {
      return res.status(201).send({
        success: false,
        message: "Category not found",
      });
    }

    // Proceed to delete the category
    const [result] = await db.query(`DELETE FROM categories WHERE id = ?`, [
      id,
    ]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete category",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};
