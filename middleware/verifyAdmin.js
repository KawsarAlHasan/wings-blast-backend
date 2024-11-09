const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const db = require("../config/db");
dotenv.config();

module.exports = async (req, res, next) => {
  try {
    const token = req.headers?.authorization?.split(" ")?.[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "You are not logged in",
      });
    }

    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "Forbidden access" });
      }

      const adminID = decoded.id;

      const [data] = await db.query(`SELECT * FROM admins WHERE id =?`, [
        adminID,
      ]);

      if (!data || data.length === 0) {
        return res.status(201).send({
          success: false,
          message: "Admin not found. Please Login Again",
        });
      }

      req.decodedAdmin = data[0];

      next();
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid Token",
      error: error.message,
    });
  }
};
