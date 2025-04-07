const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = async (req, res, next) => {
  try {
    const guestUserToken = req.headers?.authorization?.split(" ")?.[1];
    if (!guestUserToken) {
      return res.status(401).json({
        success: false,
        error: "You are not logged in",
      });
    }

    jwt.verify(
      guestUserToken,
      process.env.TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: "Forbidden access" });
        }

        req.decodedGuestId = decoded.id;

        next();
      }
    );
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid guestUserToken",
      error: error.message,
    });
  }
};
