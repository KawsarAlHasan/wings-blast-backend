const nodemailer = require("nodemailer");
require("dotenv").config();
const punycode = require("punycode/");

// Hostinger SMTP credentials
let transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NO_REPLY_EMAIL_ADD,
    pass: process.env.NO_REPLY_EMAIL_PASS,
  },
});

async function birthdayEmail(emailData) {
  try {
    const { email, subject, htmlContent } = emailData;

    const emailAddress = punycode.toASCII(email);

    const mailOptions = {
      from: process.env.NO_REPLY_EMAIL_ADD,
      to: emailAddress,
      subject: subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

async function sendEmail(emailData) {
  try {
    const { email, subject, htmlContent } = emailData;

    const emailAddress = punycode.toASCII(email);

    const mailOptions = {
      from: process.env.NO_REPLY_EMAIL_ADD,
      to: emailAddress,
      subject: subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

module.exports = { birthdayEmail, sendEmail };
