require("dotenv").config();
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOtp = async (phone) => {
  const otp = generateOTP();
  otpStore[phone] = otp;

  const data = await client.messages.create({
    body: `Your OTP code is ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });

  console.log("Message SID:", data);

  console.log("OTP sent to:", phone);
};

module.exports = { sendOtp, otpStore };
