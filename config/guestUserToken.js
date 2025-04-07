const jwt = require("jsonwebtoken");
exports.generateGuestUserToken = (guestUserInfo) => {
  const payload = {
    id: guestUserInfo.id,
  };
  const guestUserToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "10 days",
  });

  return guestUserToken;
};
