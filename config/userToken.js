const jwt = require("jsonwebtoken");
exports.generateUserToken = (userInfo) => {
  const payload = {
    id: userInfo.id,
    email: userInfo.email,
  };
  const userToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "365 days",
  });

  return userToken;
};
