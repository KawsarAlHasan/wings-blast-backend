const db = require("../../config/db");
const bcrypt = require("bcrypt");
const { generateUserToken } = require("../../config/userToken");
const { sendMail } = require("../../middleware/sandEmail");
const { sendOtp } = require("../../middleware/sendOtp");
const verifyOtp = require("../../middleware/verifyOtp");
const firebaseAdmin = require("../../config/firebase");

// send otp by twilio
exports.sendOtpByTwilio = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).send({
        success: false,
        message: "phone is required in body",
      });
    }

    await sendOtp(phone);
    res.status(200).json({
      success: true,
      message: "OTP sent Successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// verify twilio otp
exports.verifyTwilioOpt = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).send({
        success: false,
        message: "phone & otp is required in body",
      });
    }

    const token = await verifyOtp(phone, otp);
    res.status(200).json({
      success: true,
      token,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// verify user
exports.verifyToken = async (req, res) => {
  const { token, first_name, last_name } = req.body;

  if (!token) {
    return res.status(201).send({
      success: false,
      message: "token is required in body",
    });
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    const { uid, name, picture, email, phone_number } = decodedToken;

    // Check if user already exists
    const [checkData] = await db.query(`SELECT * FROM users WHERE uid=?`, [
      uid,
    ]);

    if (checkData.length > 0) {
      const existingUser = checkData[0];
      const authToken = generateUserToken({ id: existingUser.id });

      res.status(200).json({
        success: true,
        message: "User Login Successfully",
        data: {
          user: existingUser,
          token: authToken,
        },
      });
    } else {
      const [result] = await db.query(
        `INSERT INTO users (uid, first_name, last_name, email, phone, profile_pic) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          uid,
          name || first_name || "",
          last_name || "",
          email || "",
          phone_number || "",
          picture || "",
        ]
      );

      const authToken = generateUserToken({ id: result.insertId });

      const [user] = await db.query(`SELECT * FROM users WHERE id=?`, [
        result.insertId,
      ]);

      res.status(200).json({
        success: true,
        message: "User registered",
        data: {
          user: user[0],
          token: authToken,
        },
      });
    }
  } catch (error) {
    return res.status(401).send({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
};

// sign up User
exports.signUpUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    // Check if all required fields are provided
    if (!first_name || !last_name || !password) {
      return res.status(400).send({
        success: false,
        message:
          "Please provide first_name, last_name, password & account_type required fields",
      });
    }

    // Chack Duplicate entry
    const [checkEmail] = await db.query(`SELECT * FROM users WHERE email=?`, [
      email,
    ]);

    if (checkEmail.length > 0) {
      return res.status(400).send({
        success: false,
        message: "Email already exists. Please use a different email.",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO users (first_name, last_name, email, password, phone) VALUES (?, ?, ?, ?, ?)";

    const values = [first_name, last_name, email, hashedPassword, phone];

    // Insert user into the database
    const [result] = await db.query(query, values);

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert User, please try again",
      });
    }

    // Generate token after successful user creation
    const token = generateUserToken({ id: result.insertId });

    // Fetch and return the new user's information
    const [user] = await db.query(`SELECT * FROM users WHERE id=?`, [
      result.insertId,
    ]);

    // const emailData = {
    //   first_name,
    //   last_name,
    //   email,
    //   password,
    //   phone,
    // };
    // const emailResult = await sendMail(emailData);
    // if (!emailResult.messageId) {
    //   res.status(500).send("Failed to send email");
    // }

    // Send success response with the token
    return res.status(200).json({
      success: true,
      message: "User signed up successfully",
      data: {
        user: user[0],
        token,
      },
    });
  } catch (error) {
    // Handle any errors that occur during the process
    return res.status(500).send({
      success: false,
      message: "An error occurred while signing up the user",
      error: error.message,
    });
  }
};

// social media login
exports.userSocialMediaLogin = async (req, res) => {
  try {
    const { first_name, last_name, email, phone } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Please provide email. Email is required",
      });
    }

    // Check if email already exists
    const [existingUser] = await db.query(`SELECT * FROM users WHERE email=?`, [
      email,
    ]);

    let user = [];
    let loginOrSignup = "";
    if (existingUser.length > 0) {
      user = existingUser[0];
      loginOrSignup = "Login";
    } else {
      // Insert the user
      const [data] = await db.query(
        `INSERT INTO users (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)`,
        [first_name || "", last_name || "", email, phone || ""]
      );

      // Fetch and return the new user's information
      const [results] = await db.query(`SELECT * FROM users WHERE id=?`, [
        data.insertId,
      ]);
      user = results[0];
      loginOrSignup = "Signup";
    }

    // Generate JWT token
    const token = generateUserToken({ id: user.id });

    // Return success message along with the user data
    res.status(200).send({
      success: true,
      message: `User ${loginOrSignup} successfully`,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Internal Server Error`,
      error: error.message,
    });
  }
};

// user login
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        error: "Please provide your credentials",
      });
    }
    const [results] = await db.query(`SELECT * FROM users WHERE email=?`, [
      email,
    ]);
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const token = generateUserToken({ id: user.id });
    const { password: pwd, ...usersWithoutPassword } = user;
    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: {
        user: usersWithoutPassword,
        token,
      },
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "User Login Unseccess",
      error: error.message,
    });
  }
};

// get me User
exports.getMeUser = async (req, res) => {
  try {
    const user = req.decodedUser;
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// get all Users
exports.getAllUsers = async (req, res) => {
  try {
    let { page, limit, status } = req.query;

    // Default pagination values
    page = parseInt(page) || 1; // Default page is 1
    limit = parseInt(limit) || 20; // Default limit is 20
    const offset = (page - 1) * limit; // Calculate offset for pagination

    // Initialize SQL query and parameters array
    let sqlQuery = "SELECT * FROM users WHERE 1=1"; // 1=1 makes appending conditions easier
    const queryParams = [];

    // Add filters for status if provided
    if (status) {
      sqlQuery += " AND status LIKE ?";
      queryParams.push(`%${status}%`); // Using LIKE for partial match
    }

    // Add pagination to the query
    sqlQuery += " LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    // Execute the query with filters and pagination
    const [data] = await db.query(sqlQuery, queryParams);

    if (!data || data.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No users found",
        data: [],
      });
    }

    // Get total count of users for pagination info (with the same filters)
    let countQuery = "SELECT COUNT(*) as count FROM users WHERE 1=1";
    const countParams = [];

    // Add the same filters for total count query
    if (status) {
      countQuery += " AND status LIKE ?";
      countParams.push(`%${status}%`);
    }

    const [totalUsersCount] = await db.query(countQuery, countParams);
    const totalUsers = totalUsersCount[0].count;

    // Send response with users data and pagination info
    res.status(200).send({
      success: true,
      message: "All Users",
      totalUsers: totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      data: data,
    });
  } catch (error) {
    // Error handling
    res.status(500).send({
      success: false,
      message: "Error in Get All Users",
      error: error.message,
    });
  }
};

// get single user by id
exports.getSingleUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(201).send({
        success: false,
        message: "User ID is required in params",
      });
    }

    const [user] = await db.query(`SELECT * FROM users WHERE id=? `, [userId]);
    if (!user || user.length === 0) {
      return res.status(201).send({
        success: false,
        message: "No user found",
      });
    }

    const [orders] = await db.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
      [userId]
    );

    res.status(200).send({
      success: true,
      message: "Single User",
      data: {
        user: user[0],
        orders: orders,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Inernal Server Error",
      error: error.message,
    });
  }
};

// update user
exports.updateUser = async (req, res) => {
  try {
    const userPreData = req.decodedUser;

    // Extract data from the request body
    const {
      first_name,
      last_name,
      phone,
      birth_day,
      street_address,
      city,
      postal_or_zip_code,
      state_or_region,
      country,
    } = req.body;

    // Update the user data in the database
    const [data] = await db.query(
      `UPDATE users SET first_name=?, last_name=?, phone=?, street_address=?, birth_day=?, city=?, postal_or_zip_code=?, state_or_region=?, country=? WHERE id = ?`,
      [
        first_name || userPreData.first_name,
        last_name || userPreData.last_name,
        phone || userPreData.phone,
        street_address || userPreData.street_address,
        birth_day || userPreData.birth_day,
        city || userPreData.city,
        postal_or_zip_code || userPreData.postal_or_zip_code,
        state_or_region || userPreData.state_or_region,
        country || userPreData.country,
        userPreData.id,
      ]
    );

    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in updating user",
      });
    }

    res.status(200).send({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in updating user",
      error: error.message,
    });
  }
};

// update profile user
exports.updateProfileUser = async (req, res) => {
  try {
    const userPreData = req.decodedUser;

    const images = req.file;
    let profile_pic = userPreData?.profile_pic;
    if (images && images.path) {
      profile_pic = `https://api.wingsblast.com/public/images/${images.filename}`;
    }

    // Update the user data in the database
    const [data] = await db.query(
      `UPDATE users SET profile_pic=? WHERE id = ?`,
      [profile_pic, userPreData.id]
    );

    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in updating user",
      });
    }

    res.status(200).send({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in updating user",
      error: error.message,
    });
  }
};

// user status
exports.userStatusUpdate = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(201).send({
        success: false,
        message: "User ID is required in params",
      });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(201).send({
        success: false,
        message: "status is requied in body",
      });
    }

    const [data] = await db.query(`SELECT * FROM users WHERE id=? `, [userId]);
    if (!data || data.length === 0) {
      return res.status(201).send({
        success: false,
        message: "No user found",
      });
    }

    await db.query(`UPDATE users SET status=?  WHERE id =?`, [status, userId]);

    res.status(200).send({
      success: true,
      message: "status updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update status ",
      error: error.message,
    });
  }
};

// user password update
exports.updateUserPassword = async (req, res) => {
  try {
    const userID = req.decodedUser.id;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(201).send({
        success: false,
        message: "Old Password and New Password is requied in body",
      });
    }
    const checkPassword = req.decodedUser?.password;

    const isMatch = await bcrypt.compare(old_password, checkPassword);

    if (!isMatch) {
      return res.status(403).json({
        success: false,
        error: "Your Old Password is not correct",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    const [result] = await db.query(`UPDATE users SET password=? WHERE id =?`, [
      hashedPassword,
      userID,
    ]);

    if (!result) {
      return res.status(403).json({
        success: false,
        error: "Something went wrong",
      });
    }

    res.status(200).send({
      success: true,
      message: "User password updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in password Update User",
      error: error.message,
    });
  }
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    const userID = req.params.id;

    const [data] = await db.query(`SELECT * FROM users WHERE id=? `, [userID]);
    if (!data || data.length === 0) {
      return res.status(201).send({
        success: false,
        message: "No user found",
      });
    }
    await db.query(`DELETE FROM users WHERE id=?`, [userID]);
    res.status(200).send({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete User",
      error: error.message,
    });
  }
};
