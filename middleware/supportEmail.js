const nodemailer = require("nodemailer");
require("dotenv").config();
const punycode = require("punycode/");

// Hostinger SMTP credentials
let transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_ADD,
    pass: process.env.EMAIL_PASS,
  },
});

async function supportEmail(data) {
  try {
    const { email, subject, message } = data;

    console.log(email);

    const emailAddress = punycode.toASCII(email);

    const htmlContent = `
    <html>
    <body>
      <h3>${subject}</h3>
      <p>${message}</p>
      <p>For further assistance, please contact our support team.</p>
    </body>
    </html>
  `;
    const mailOptions = {
      from: process.env.EMAIL_ADD,
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

module.exports = { supportEmail };
