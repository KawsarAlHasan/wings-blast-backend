// const admin = require("./firebase");
const { otpStore } = require("./sendOtp");

const verifyOtp = async (phone, userOtp) => {
  const validOtp = otpStore[phone];

  if (userOtp === validOtp) {
    const customToken = "token-success";
    // const uid = phone;
    // const customToken = await admin.auth().createCustomToken(uid);
    // console.log("Login successful. Token:", customToken);
    return customToken;
  } else {
    throw new Error("Invalid OTP");
  }
};

module.exports = verifyOtp;
